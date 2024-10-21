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
      <div class="h-screen w-screen box-border p-0 m-0">
        <div class="h-full flex flex-col bg-slate-500 box-border">
          <TimeOveriew employee={props.data} />
        </div>
      </div>
    </DataProvider>
  );
}
