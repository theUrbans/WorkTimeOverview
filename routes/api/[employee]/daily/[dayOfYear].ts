import { FreshContext } from "$fresh/server.ts";
import Api from "../../../../api/index.ts";
import { logger } from "../../../../utils/logger.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
) => {
  try {
    const day = ctx.params.dayOfYear;
    const employeeId = ctx.params.employee;

    if (
      !day || isNaN(Number(day)) || !employeeId || isNaN(Number(employeeId))
    ) {
      return new Response("Invalid day or invalid employee number", {
        status: 400,
      });
    }
    const daily = await Api.timeService.getTodayWorktime(
      Number(employeeId),
      Number(day),
    );

    return new Response(
      JSON.stringify(daily),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error(error);
    return new Response("Error", { status: 500 });
  }
};
