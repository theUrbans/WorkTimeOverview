import type Database from "../database.ts";

interface ITimeService {
  getDailyTime(): Promise<object[]>;
}

class TimeService {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  public async getTodayWorktime(employeeId: number) {
    const rows = await this.db.query<TimeEntry>(
      `SELECT * FROM timekeeping WHERE employee = ${employeeId} AND log_date = CURRENT_DATE`,
    );

    const dailyTime = rows.reduce((acc, row) => {
      const timeIn = this.timeToDate(row.login);
      const timeOut = row.logout ? this.timeToDate(row.logout) : new Date();
      const timeDifference = this.calculateTimeDifference(timeIn, timeOut);
      return acc + timeDifference;
    }, 0);

    return this.millisecondsToTime(dailyTime);
  }

  private calculateTimeDifference(timeIn: Date, timeOut: Date) {
    return timeOut.getTime() - timeIn.getTime();
  }

  private sumTime() { }

  private timeToDate(time: string): Date {
    // time format HH:MM:SS => Date
    const timeArray = time.split(":");
    const date = new Date();
    date.setHours(parseInt(timeArray[0], 10));
    date.setMinutes(parseInt(timeArray[1], 10));
    date.setSeconds(parseInt(timeArray[2], 10));
    date.setMilliseconds(0);
    return date;
  }

  private millisecondsToTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  public async getEmployeeData(employeeId: number) {
    // get data from employees table where area = employeeId
    employeeId
    const data = await this.db.query(`SELECT * FROM employees WHERE area = '7'`);
    // holiday key: HD
    // working days key: WorkingDays
    // working hours key: WeekHours
    // case HolidayTypes.PlusHours: return 'P';
    // case HolidayTypes.Vacation: return 'V'; done
    // case HolidayTypes.OldVacation: return 'O';
    // case HolidayTypes.Sick: return 'K';
    // case HolidayTypes.SpecialLeave: return 'S';
    // case HolidayTypes.Excused: return 'E';
    // case HolidayTypes.Correction: return 'C';
    console.log({ data });
  }
}

export default TimeService;
