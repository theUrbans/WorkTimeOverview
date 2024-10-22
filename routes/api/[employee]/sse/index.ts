import type { FreshContext } from "$fresh/server.ts";
import api from "../../../../api/index.ts";

const INTERVAL_SECONDS = 60;
const interval = INTERVAL_SECONDS * 1000;

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
            const data = `data: ${JSON.stringify({ ...time })}\n\n`;
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error("Error encoding data:", error);
            controller.error(error);
            clearInterval(id);
          }
        }, interval);

        controller.enqueue(
          new TextEncoder().encode(`retry: ${INTERVAL_SECONDS} seconds\n\n`),
        );

        return () => {
          clearInterval(id);
        };
      },
      cancel() {
        console.info("Stream canceled");
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
