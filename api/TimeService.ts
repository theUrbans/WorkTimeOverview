import { weekOfYear } from "@std/datetime/week-of-year";
import type Database from "../database.ts";
import { dailyWorkTimeFromWeekly } from "../utils/timeHelper.ts";
import { dayOfYear } from "@std/datetime/day-of-year";

export type TodayResponse = {
  time: string;
  inProgress: boolean;
};

export type WeeklyResponse = {
  time: string;
  timeDifference: string;
};

export type EmployeeDataResponse = {
  name: string;
  birthday: string;
  workingDays: {
    days: number;
    since?: string;
  };
  weekHours: {
    hours: number;
    since?: string;
  };
};

export type MonthlyWorkTimeResponse = {
  [date: string]: {
    day: Date;
    time: string;
    pause: string;
    logs: { in: string; out: string }[];
  };
};

export type TimeDoneResponse = {
  daily: { done: boolean; left: string };
  weekly: { done: boolean; left: string };
};

class TimeService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getTodayWorktime(
    employeeId: number,
    dayOfYear: number,
  ): Promise<TodayResponse> {
    const rows = await this.db.query<TimeEntry>(
      `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(DOY FROM log_date) = ${dayOfYear}`,
    );

    const dailyTime = rows.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      return acc + this.calculateTimeDifference(timeIn, timeOut);
    }, 0);

    return {
      time: this.millisecondsToTime(dailyTime),
      inProgress: rows.length > 0 && rows.at(-1)?.logout === null,
    };
  }

  private calculateTimeDifference(timeIn: Date, timeOut: Date): number {
    return timeOut.getTime() - timeIn.getTime();
  }

  private timeToDate(time: string): Date {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  private millisecondsToTime(ms: number): string {
    const absMs = Math.abs(ms);
    const seconds = Math.floor(absMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, "0")}:${
      (minutes % 60).toString().padStart(2, "0")
    }:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  private timeToMilliseconds(time: string): number {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  private hoursToMilliseconds(hours: number): number {
    return hours * 3600 * 1000;
  }

  public async getEmployeeData(
    employeeId: number,
  ): Promise<EmployeeDataResponse> {
    const [birthday, name, workingDays, weekHours] = await Promise.all([
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'Birthday'`,
      ),
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'Name'`,
      ),
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'WorkingDays'`,
      ),
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'WeekHours'`,
      ),
    ]);

    return {
      birthday: birthday[0].value,
      name: name[0].value,
      weekHours: {
        hours: parseInt(weekHours.at(-1)?.value.split(";")[0] ?? "0"),
        since: weekHours.at(-1)?.value.split(";")[1],
      },
      workingDays: {
        days: parseInt(workingDays.at(-1)?.value.split(";")[0] ?? "0"),
        since: workingDays.at(-1)?.value.split(";")[1],
      },
    };
  }

  public async getMonthlyTime(employeeId: number): Promise<string> {
    const rows = await this.db.query<TimeEntry>(
      `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(MONTH FROM log_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM log_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    );

    const monthlyTime = rows.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      return acc + this.calculateTimeDifference(timeIn, timeOut);
    }, 0);

    return this.millisecondsToTime(monthlyTime);
  }

  public async getWeeklyTime(
    employeeId: number,
    week: number,
    weekHours: number,
  ): Promise<WeeklyResponse> {
    const rows = await this.db.query<TimeEntry>(
      `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(WEEK FROM log_date) = ${week} AND EXTRACT(YEAR FROM log_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    );

    const weeklyTime = rows.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      return acc + this.calculateTimeDifference(timeIn, timeOut);
    }, 0);

    return {
      time: this.millisecondsToTime(weeklyTime),
      timeDifference: this.millisecondsToTime(
        weeklyTime - this.hoursToMilliseconds(weekHours),
      ),
    };
  }

  public getHolidayDays(): Date[] {
    const easterSunday = () => {
      const year = new Date().getFullYear();
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const n0 = h + l + 7 * m + 114;
      const n = Math.floor(n0 / 31) - 1;
      const p = n0 % 31 + 1;
      return new Date(year, n, p);
    };

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const easter = easterSunday();

    return [
      new Date(new Date().getFullYear(), 0, 1),
      new Date(new Date().getFullYear(), 4, 1),
      new Date(new Date().getFullYear(), 4, 8),
      new Date(new Date().getFullYear(), 9, 3),
      new Date(new Date().getFullYear(), 9, 31),
      new Date(new Date().getFullYear(), 11, 25),
      new Date(new Date().getFullYear(), 11, 26),
      easter,
      addDays(easter, 1),
      addDays(easter, 39),
      addDays(easter, 49),
      addDays(easter, 50),
      addDays(easter, 60),
    ];
  }

  public async getMonthlyWorkTime(
    employeeId: number,
    month: number,
    year: number,
  ): Promise<MonthlyWorkTimeResponse> {
    const rows = await this.db.query<TimeEntry>(
      `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(MONTH FROM log_date) = ${month} AND EXTRACT(YEAR FROM log_date) = ${year}`,
    );

    const timeMap: MonthlyWorkTimeResponse = {};

    for (const row of rows) {
      const logDate = new Date(row.log_date);
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      const timeDifference = this.calculateTimeDifference(timeIn, timeOut);
      const day = logDate;
      const time = this.millisecondsToTime(timeDifference);

      const dateKey = logDate.toISOString();
      if (timeMap[dateKey]) {
        const existingEntry = timeMap[dateKey];
        existingEntry.logs.push({ in: row.login, out: row.logout });
        existingEntry.time = this.millisecondsToTime(
          timeDifference + this.timeToMilliseconds(existingEntry.time),
        );
      } else {
        timeMap[dateKey] = {
          day,
          time,
          pause: "",
          logs: [{ in: row.login, out: row.logout }],
        };
      }
    }

    Object.values(timeMap).forEach((value) => {
      const logs = value.logs;
      let pause = 0;
      for (const [i, log] of logs.entries()) {
        if (i < logs.length - 1) {
          const timeIn = this.timeToDate(log.out);
          const timeOut = this.timeToDate(logs[i + 1].in);
          pause += this.calculateTimeDifference(timeIn, timeOut);
        }
      }
      value.pause = this.millisecondsToTime(pause);
    });

    return timeMap;
  }

  public async checkTimeDone(
    employeeId: number,
    date: Date,
  ): Promise<TimeDoneResponse> {
    const year = date.getFullYear();
    const week = weekOfYear(date);
    const doy = dayOfYear(date);

    const [weeklyHours, workingDays] = await Promise.all([
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'WeekHours'`,
      ),
      this.db.query<DataEntry>(
        `SELECT * FROM employees WHERE area = '${employeeId}' and key = 'WorkingDays'`,
      ),
    ]);

    const weeklyHoursNumber = parseInt(
      weeklyHours.at(-1)?.value.split(";")[0] ?? "0",
    );
    const workingDaysNumber =
      (workingDays.at(-1)?.value.split(";")[0] ?? "0").length;

    const dailyHours = dailyWorkTimeFromWeekly(
      weeklyHoursNumber,
      workingDaysNumber,
    );

    const [dailyTime, weeklyTime] = await Promise.all([
      this.db.query<TimeEntry>(
        `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(DOY FROM log_date) = ${doy} AND EXTRACT(YEAR FROM log_date) = ${year} order by id`,
      ),
      this.db.query<TimeEntry>(
        `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND EXTRACT(WEEK FROM log_date) = ${week} AND EXTRACT(YEAR FROM log_date) = ${year} order by id`,
      ),
    ]);

    const dailyTimeSum = dailyTime.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      return acc + this.calculateTimeDifference(timeIn, timeOut);
    }, 0);

    const weeklyTimeSum = weeklyTime.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      return acc + this.calculateTimeDifference(timeIn, timeOut);
    }, 0);

    return {
      daily: {
        done: dailyTimeSum >= this.timeToMilliseconds(dailyHours),
        left: this.millisecondsToTime(
          this.timeToMilliseconds(dailyHours) - dailyTimeSum,
        ),
      },
      weekly: {
        done: weeklyTimeSum >= this.hoursToMilliseconds(weeklyHoursNumber),
        left: this.millisecondsToTime(
          this.hoursToMilliseconds(weeklyHoursNumber) - weeklyTimeSum,
        ),
      },
    };
  }
}

export default TimeService;
