import type { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const form = await req.formData();
    const id = form.get("id");

    const headers = new Headers();
    headers.set("location", `/time/${id}`);
    return new Response(null, {
      status: 302,
      headers,
    });
  },
};

export default function TodayTime() {
  return (
    <div class="h-screen w-screen bg-slate-800 p-0 m-0 grid place-content-center">
      <form
        class="bg-slate-300 rounded-xl p-4 flex flex-col gap-4"
        method="post"
      >
        <label htmlFor="id">Mitarbeiternummer eingeben:</label>
        <input
          id="id"
          name="id"
          type="text"
          class="border-2 border-transparent hover:border-blue-400 p-2 rounded-md text-center"
        />
        <button
          type="submit"
          class="bg-slate-600 p-4 rounded-md text-white hover:bg-blue-300 hover:text-black transition"
        >
          Weiter
        </button>
      </form>
    </div>
  );
}
