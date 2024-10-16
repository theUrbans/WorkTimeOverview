import type { Handlers, PageProps } from "$fresh/server.ts";
import Api from "../../api/index.ts";
import { useSignal } from "@preact/signals";
import type {
  MontylWorkTimeResponse,
  TodayResponse,
  WeeklyResponse,
} from "../../api/TimeService.ts";
import Calendar from "../../islands/Calendar.tsx";

export type HandlerResponse = {
  today: TodayResponse;
  weekly: WeeklyResponse;
  monthly: MontylWorkTimeResponse;
  id?: number;
};

export const handler: Handlers<HandlerResponse> = {
  async GET(_req, ctx) {
    const id = ctx.params.id;
    if (!id || isNaN(Number(id))) {
      return new Response("Invalid ID", { status: 400 });
    }
    const today = await Api.timeService.getTodayWorktime(Number(id));
    const empData = await Api.timeService.getEmployeeData(Number(id));
    const weekly = await Api.timeService.getWeeklyTime(
      Number(id),
      empData.weekHours.hours,
    );
    const monthly = await Api.timeService.getMonthlyWorkTime(Number(id));
    console.log({ empData, today, weekly, monthly });
    return ctx.render({ today, weekly, monthly, id: Number(id) });
  },
};

export default function TodayTime(props: PageProps<HandlerResponse>) {
  const year = useSignal(new Date().getFullYear());
  const month = useSignal(new Date().getMonth());
  return (
    <div class="h-screen w-screen box-border p-0 m-0">
      <div class="h-full flex flex-col bg-slate-500 box-border">
        {/* <TodayTimer time={time} inProgess={props.data.inProgress} /> */}
        <Calendar year={year} month={month} employeeId={props.data.id ?? 0} />
      </div>
    </div>
  );
}
