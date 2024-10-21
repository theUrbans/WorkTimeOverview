import type { FreshContext } from "$fresh/server.ts";
import api from "../../../../api/index.ts";

export const handler = (
  _req: Request,
  ctx: FreshContext,
) => {
  try {
    const employee = ctx.params.employee;
    const stream = new ReadableStream({
      start(controller) {
        const id = setInterval(async () => {
          try {
            const time = await api.timeService.checkTimeDone(
              Number(employee),
              new Date(),
            );
            const data = `data: ${JSON.stringify({ time })}\n`;
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error("Error encoding data:", error);
            controller.error(error);
            clearInterval(id);
          }
        }, 10000);

        controller.enqueue(new TextEncoder().encode("retry: 10000\n\n")); // Set retry interval to 10 seconds

        return () => {
          clearInterval(id);
        };
      },
      cancel() {
        console.log("Stream canceled");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
