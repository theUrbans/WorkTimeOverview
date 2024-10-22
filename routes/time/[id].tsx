import type { Handlers, PageProps } from "$fresh/server.ts";
import TimeOveriew from "../../islands/TimeOverview.tsx";
import { DataProvider } from "../../utils/dataStore.tsx";

export type HandlerResponse = number;

export const handler: Handlers<HandlerResponse> = {
  GET(_req, ctx) {
    const id = ctx.params.id;
    if (!id || isNaN(Number(id))) {
      return new Response("Invalid ID", { status: 400 });
    }
    return ctx.render(Number(id));
  },
};

export default function TodayTime(props: PageProps<HandlerResponse>) {
  return (
    <DataProvider>
      <TimeOveriew employee={props.data} />
    </DataProvider>
  );
}
