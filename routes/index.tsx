import type { Handlers, PageProps } from "$fresh/server.ts";
import denoJson from "../deno.json" with { type: "json" };

export type HandlerResponse = string;

export const handler: Handlers<HandlerResponse> = {
  GET(_req, ctx) {
    return ctx.render(denoJson.version);
  },
};

export default function Home(props: PageProps<HandlerResponse>) {
  return (
    <div class=" h-full flex flex-col justify-between">
      <header class="bg-primary text-white">
        <nav>
          <ul class="p-4 flex gap-4 text-xl">
            <li class="underline">
              <a href="/time">Time</a>
            </li>
          </ul>
        </nav>
      </header>
      <main class="w-screen h-screen flex flex-col justify-between bg-background">
        <div class="max-w-prose m-auto h-full">
          <h1 class="font-bold text-4xl weider py-4">
            Arbeitszeit Übersicht
          </h1>
          <article>
            <p>
              Unter dem <code>Time</code>{" "}
              Reiter findet man seine Arbeitszeitübersicht.
            </p>
            <p>
              Dafür einfach oben links auf <code>Time</code>{" "}
              klicken und danach die eigene Mitarbeiternummer eingeben. Dann
              wird man zu seiner Arbeitszeitübersicht weitergeleitet.
            </p>
          </article>
        </div>
      </main>
      <footer class="w-full h-24 bg-secondary grid place-content-center">
        TimeCal v{props.data}
      </footer>
    </div>
  );
}
