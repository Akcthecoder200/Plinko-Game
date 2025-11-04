export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎰 Plinko Lab
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Provably-Fair Plinko Game with Deterministic RNG
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/play"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform shadow-lg"
          >
            Play Now
          </a>
          <a
            href="/verify"
            className="px-8 py-4 bg-gray-800 rounded-lg font-semibold text-white hover:bg-gray-700 transition-colors shadow-lg"
          >
            Verify Results
          </a>
        </div>

        <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-white">✨ Features</h2>
          <ul className="text-left space-y-2 text-gray-300">
            <li>🎲 12-row Plinko board with 13 landing bins</li>
            <li>🔐 Provably-fair commit-reveal protocol</li>
            <li>🎯 Deterministic xorshift32 PRNG</li>
            <li>✅ Fully verifiable results with SHA-256</li>
            <li>🎨 Smooth animations and sound effects</li>
            <li>♿ Keyboard accessible (←/→ to move, Space to drop)</li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Built with Next.js 14, TypeScript, Tailwind CSS, Prisma & SQLite
          </p>
        </div>
      </div>
    </main>
  );
}
