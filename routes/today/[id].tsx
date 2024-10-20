import type { Handlers, PageProps } from "$fresh/server.ts";
import Api from "../../api/index.ts";
import { useSignal } from "@preact/signals";
import type {
  MonthlyWorkTimeResponse,
  TodayResponse,
  WeeklyResponse,
} from "../../api/TimeService.ts";
import Calendar from "../../islands/Calendar.tsx";

import { weekOfYear } from "@std/datetime/week-of-year";

export type HandlerResponse = {
  data: {
    today: TodayResponse;
    weekly: WeeklyResponse;
    monthly: MonthlyWorkTimeResponse;
  };
  id?: number;
};

export const handler: Handlers<HandlerResponse> = {
  async GET(_req, ctx) {
    const id = ctx.params.id;
    if (!id || isNaN(Number(id))) {
      return new Response("Invalid ID", { status: 400 });
    }
    const month = Number(ctx.url.searchParams.get("month")) ||
      new Date().getMonth();
    const year = Number(ctx.url.searchParams.get("year")) ||
      new Date().getFullYear();
    const today = await Api.timeService.getTodayWorktime(Number(id));
    const empData = await Api.timeService.getEmployeeData(Number(id));
    const weekly = await Api.timeService.getWeeklyTime(
      Number(id),
      weekOfYear(new Date()),
      empData.weekHours.hours,
    );
    const monthly = await Api.timeService.getMonthlyWorkTime(
      Number(id),
      month,
      year,
    );
    console.log({ empData, today, weekly, monthly });
    return ctx.render({ data: { today, weekly, monthly }, id: Number(id) });
  },
};

export default function TodayTime(props: PageProps<HandlerResponse>) {
  const data = useSignal(props.data);
  return (
    <div class="h-screen w-screen box-border p-0 m-0">
      <div class="h-full flex flex-col bg-slate-500 box-border">
        {/* <TodayTimer time={time} inProgess={props.data.inProgress} /> */}
        <Calendar data={data} employeeId={props.data.id ?? 0} />
      </div>
    </div>
  );
}
