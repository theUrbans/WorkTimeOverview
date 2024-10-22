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
    <div class="h-screen w-screen bg-background p-0 m-0 grid place-content-center">
      <form
        class="bg-secondary rounded-xl p-4 flex flex-col gap-4"
        method="post"
      >
        <label htmlFor="id">Mitarbeiternummer eingeben:</label>
        <input
          id="id"
          name="id"
          type="text"
          class="border-2 border-transparent hover:border-accent p-2 rounded-md text-center"
        />
        <button
          type="submit"
          class="bg-primary p-4 rounded-md text-white hover:text-text hover:bg-accent transition"
        >
          Weiter
        </button>
      </form>
    </div>
  );
}
