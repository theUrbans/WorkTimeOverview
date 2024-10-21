import { type PageProps } from "$fresh/server.ts";
import type { ComponentChildren } from "preact";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WorkTime</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Layout>
          <Component />
        </Layout>
      </body>
    </html>
  );
}

type LayoutProps = {
  children: ComponentChildren;
};

function Layout({ children }: LayoutProps) {
  return (
    <main class="h-screen w-screen box-border p-0 m-0">
      <div class="h-full flex flex-col bg-slate-500">
        {children}
      </div>
    </main>
  );
}
