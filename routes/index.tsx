export default function Home() {
  return (
    <>
      <header>
        <nav>
          <ul class="px-4 flex gap-4">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </header>
      <main class="w-screen h-screen bg-gray-600"></main>
    </>
  );
}
