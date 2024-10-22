import { useState } from "preact/hooks";

interface CalendarProps {
  startOfWeek?: number; // 1 (Monday) to 7 (Sunday)
  daysToShow?: number[]; // Array of day numbers (1-7)
  dayNames?: string[]; // Custom names for the days
  weekLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  renderDay?: (date: Date) => preact.JSX.Element;
  renderWeek?: (weekNumber: number) => preact.JSX.Element;
  onChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

const CalendarComponent: preact.FunctionalComponent<CalendarProps> = ({
  startOfWeek = 7,
  daysToShow = [1, 2, 3, 4, 5, 6, 7],
  dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  weekLabel = "Wk",
  nextLabel = "Next",
  prevLabel = "Prev",
  renderDay,
  renderWeek,
  onChange,
  onDayClick,
}) => {
  const dayIndexes = daysToShow.map((day) => day % 7);

  dayNames = dayNames.filter((_, index) =>
    dayIndexes.includes((index + 1) % 7)
  );

  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    return `${year}-${month}`;
  };

  const getWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 +
      Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return weekNumber;
  };

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    setCurrentDate(prevMonthDate);
    if (onChange) {
      onChange(prevMonthDate);
    }
  };

  const handleNextMonth = () => {
    const nextMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    setCurrentDate(nextMonthDate);
    if (onChange) {
      onChange(nextMonthDate);
    }
  };

  const handleDateChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const [year, month] = target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  const generateCalendar = () => {
    const weeks = [];
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const startDayOfWeek = startOfWeek % 7;
    const firstWeekday = firstDayOfMonth.getDay();
    const dayOffset = (firstWeekday - startDayOfWeek + 7) % 7;

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - dayOffset);

    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const lastWeekday = lastDayOfMonth.getDay();
    const endDayOffset =
      (startDayOfWeek + dayIndexes.length - 1 - lastWeekday + 7) % 7;
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + endDayOffset);

    const date = new Date(startDate);

    while (date <= endDate) {
      const weekNumber = getWeekNumber(date);
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        if (dayIndexes.includes(date.getDay())) {
          weekDates.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
      }
      weeks.push({
        weekNumber,
        dates: weekDates,
      });
    }

    return weeks.map((week) => (
      <>
        <>
          {renderWeek ? renderWeek(week.weekNumber) : week.weekNumber}
        </>
        {week.dates.map((date) => (
          <div
            onClick={() => onDayClick?.(date)}
            style={{
              cursor: onDayClick ? "pointer" : "default",
            }}
          >
            {renderDay ? renderDay(date) : date.getDate()}
          </div>
        ))}
      </>
    ));
  };

  return (
    <div class="calendar-component h-full w-full flex flex-col gap-2">
      <div class="flex items-center justify-center gap-2 p-2">
        <button
          onClick={handlePrevMonth}
          class="bg-secondary text-primary px-4 py-2 rounded-md border-2 border-transparent border-solid hover:border-accent"
        >
          {prevLabel}
        </button>
        <input
          type="month"
          value={formatDateForInput(currentDate)}
          onChange={handleDateChange}
          class="bg-secondary text-primary px-4 py-2 rounded-md border-2 border-transparent border-solid hover:border-accent"
        />
        <button
          onClick={handleNextMonth}
          class="bg-secondary text-primary px-4 py-2 rounded-md border-2 border-transparent border-solid hover:border-accent"
        >
          {nextLabel}
        </button>
      </div>
      <div
        class="grid gap-2 p-2 h-full box-border"
        style={{
          gridTemplateColumns: `max-content repeat(${dayIndexes.length}, auto)`,
          gridTemplateRows: "4rem",
        }}
      >
        {[weekLabel, ...dayNames].map((label) => (
          <span class="font-bold p-2 text-center h-content grid place-content-center">
            {label}
          </span>
        ))}
        {generateCalendar()}
      </div>
    </div>
  );
};

export default CalendarComponent;
