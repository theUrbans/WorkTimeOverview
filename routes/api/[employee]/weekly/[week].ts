import { FreshContext } from "$fresh/server.ts";
import Api from "../../../../api/index.ts";
import { logger } from "../../../../utils/logger.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
) => {
  try {
    const week = ctx.params.week;
    const employeeId = ctx.params.employee;
    const weeklyHours = ctx.url.searchParams.get(
      "whrs",
    ) as unknown as number;

    if (
      !week || isNaN(Number(week)) || !employeeId ||
      isNaN(Number(employeeId)) || Number(week) < 1 || Number(week) > 52
    ) {
      return new Response("Invalid arguments", { status: 400 });
    }
    const weekly = await Api.timeService.getWeeklyTime(
      Number(employeeId),
      Number(week),
      weeklyHours ?? 0,
    );

    return new Response(
      JSON.stringify(weekly),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error(error);
    return new Response("Error", { status: 500 });
  }
};
