import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      href: "/audio-studio",
      icon: "🎵",
      title: "Audio Studio",
      description:
        "Capture microphone input in real time. FFT analysis drives a p5.js canvas that paints your sound as light.",
    },
    {
      href: "/poetry-editor",
      icon: "✍️",
      title: "Poetry Editor",
      description:
        "Write in Markdown, preview live. Animated visuals overlay your words as you compose.",
    },
    {
      href: "/score-export",
      icon: "📦",
      title: "Score Export",
      description:
        "Bundle audio, visuals, and poem into a score package. Saved locally in IndexedDB and synced to CouchDB.",
    },
  ];

  return (
    <div className="flex flex-col items-center px-6 py-24 animate-fade-in">
      <h1 className="gradient-text text-5xl font-bold text-center leading-tight mb-4">
        Sensory Composer
      </h1>
      <p className="text-gray-400 text-lg text-center max-w-xl mb-16">
        A multisensory creative web app for composing music, generating visuals,
        and writing poetry — all in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="glass rounded-2xl p-6 hover:border-primary-500 transition-all duration-300 hover:scale-105 group"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h2 className="text-white font-semibold text-lg mb-2 group-hover:gradient-text">
              {f.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {f.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-gray-600 text-xs">
          Powered by Next.js · p5.js · Laravel · FastAPI · Rust · PouchDB
        </p>
      </div>
    </div>
  );
}
