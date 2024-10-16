import { FreshContext } from "$fresh/server.ts";
import Api from "../../api/index.ts";

export const handler = async (_req: Request, ctx: FreshContext) => {
  const id = ctx.params.id;
  if (!id || isNaN(Number(id))) {
    return new Response("Invalid ID", { status: 400 });
  }
  try {
    const monthly = await Api.timeService.getMonthlyWorkTime(Number(id));
    const today = await Api.timeService.getTodayWorktime(Number(id));
    const empData = await Api.timeService.getEmployeeData(Number(id));
    const weekly = await Api.timeService.getWeeklyTime(
      Number(id),
      empData.weekHours.hours,
    );
    console.log({ monthly, xxx: JSON.stringify(monthly) });

    return new Response(
      JSON.stringify({ today, weekly, monthly, employeeId: id }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};
