import { FreshContext } from "$fresh/server.ts";
import { weekOfYear } from "@std/datetime/week-of-year";
import Api from "../../../api/index.ts";

export const handler = async (_req: Request, ctx: FreshContext) => {
  const id = ctx.params.employee;
  const query = ctx.url.searchParams;
  const month = Number(query.get("month")) + 1 || new Date().getMonth() + 1;
  const year = Number(query.get("year")) || new Date().getFullYear();
  if (!id || isNaN(Number(id))) {
    return new Response("Invalid ID", { status: 400 });
  }
  try {
    const monthly = await Api.timeService.getMonthlyWorkTime(
      Number(id),
      month,
      year,
    );
    const today = await Api.timeService.getTodayWorktime(Number(id));
    const empData = await Api.timeService.getEmployeeData(Number(id));
    const weekly = await Api.timeService.getWeeklyTime(
      Number(id),
      weekOfYear(new Date()),
      empData.weekHours.hours,
    );
    console.log({ monthly, xxx: JSON.stringify(monthly) });

    return new Response(
      JSON.stringify({ data: { today, weekly, monthly }, employeeId: id }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};
