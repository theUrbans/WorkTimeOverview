import { FreshContext } from "$fresh/server.ts";
import Api from "../../../../api/index.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
) => {
  try {
    const month = ctx.params.month;
    const employeeId = ctx.params.employee;
    if (
      !month || isNaN(Number(month)) || !employeeId ||
      isNaN(Number(employeeId)) || Number(month) < 1 || Number(month) > 12
    ) {
      return new Response("Invalid arguments", { status: 400 });
    }
    const monthly = await Api.timeService.getMonthlyWorkTime(
      Number(employeeId),
      Number(month),
      new Date().getFullYear(),
    );

    return new Response(
      JSON.stringify(monthly),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};
