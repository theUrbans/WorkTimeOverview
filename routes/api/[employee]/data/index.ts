import { FreshContext } from "$fresh/server.ts";
import Api from "../../../../api/index.ts";
import { logger } from "../../../../utils/logger.ts";

export const handler = async (_req: Request, ctx: FreshContext) => {
  try {
    const id = ctx.params.employee;
    if (!id || isNaN(Number(id))) {
      return new Response("Invalid ID", { status: 400 });
    }
    const empData = await Api.timeService.getEmployeeData(Number(id));

    return new Response(
      JSON.stringify(empData),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error(error);
    return new Response("Error", { status: 500 });
  }
};
