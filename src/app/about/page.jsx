"use client";

export default function About() {
  return (
    <section className="md:pt-36 pt-32 min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-400">About Himel's Library</h1>
        <p className="text-lg leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-800">Himel's Library</span> is a modern
          full-stack web application designed to make reading, reviewing, and
          borrowing books easier and more enjoyable. It provides users with an
          intuitive experience to explore books, post reviews, and manage their
          library activity seamlessly.
        </p>
        <p className="text-lg leading-relaxed text-gray-600">
          Built with a <span className="font-semibold text-gray-800">Go backend</span> and a{" "}
          <span className="font-semibold text-gray-800">Next.js frontend</span>, it leverages
          modern web technologies such as TailwindCSS, shadcn/ui, and PostgreSQL
          for performance and scalability.
        </p>
        <p className="text-lg italic text-gray-400">
          “A reader lives a thousand lives before he dies. The man who never
          reads lives only one.” — George R.R. Martin
        </p>
      </div>
    </section>
  );
}
