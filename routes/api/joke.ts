import { FreshContext } from "$fresh/server.ts";

export const handler = (_req: Request, _ctx: FreshContext) => {
  return new Response("daily");
};
