import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Sensory Composer",
  description:
    "A multisensory creative web application for composing music, generating video, and writing poetry.",
  keywords: ["music", "poetry", "audio", "visual", "creative", "composition"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          src="https://unpkg.com/htmx.org@1.9.12"
          integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2uodhrgzdVXbdJ+2J5bSc4nj8E3XGnlgWj"
          crossOrigin="anonymous"
          defer
        />
        <script
          src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js"
          defer
        />
        <script
          src="https://unpkg.com/hyperscript.org@0.9.12"
          defer
        />
      </head>
      <body className="antialiased">
        <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-3">
          <a href="/" className="gradient-text text-xl font-bold tracking-tight">
            Sensory Composer
          </a>
          <div className="flex gap-6 text-sm font-medium text-gray-300">
            <a href="/audio-studio" className="hover:text-white transition-colors">
              Audio Studio
            </a>
            <a href="/poetry-editor" className="hover:text-white transition-colors">
              Poetry Editor
            </a>
            <a href="/score-export" className="hover:text-white transition-colors">
              Score Export
            </a>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="py-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Sensory Composer. Built with Next.js,
          p5.js, and Laravel.
        </footer>
      </body>
    </html>
  );
}
