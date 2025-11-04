"use client";

import { useState } from "react";

export default function VerifyPage() {
  const [serverSeed, setServerSeed] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [nonce, setNonce] = useState("");
  const [dropColumn, setDropColumn] = useState("6");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!serverSeed || !clientSeed || !nonce || !dropColumn) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({
        serverSeed,
        clientSeed,
        nonce,
        dropColumn,
      });

      const res = await fetch(`/api/verify?${params}`);
      const data = await res.json();

      setResult(data);
    } catch (error) {
      console.error("Verification error:", error);
      setResult({ error: "Failed to verify round" });
    } finally {
      setLoading(false);
    }
  };

  // Load test data
  const loadTestData = () => {
    setServerSeed(
      "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc"
    );
    setClientSeed("candidate-hello");
    setNonce("42");
    setDropColumn("6");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            🎰 Plinko Lab
          </a>
          <div className="text-xs text-gray-400 mt-1">
            Round Verification Tool
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🔍 Verify Round Fairness
            </h1>
            <p className="text-gray-400">
              Enter the round details to verify the outcome was deterministic
              and fair
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server Seed (64 hex characters)
              </label>
              <input
                type="text"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
                placeholder="e.g., b2a5f3f32a4d9c6e..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Seed
              </label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="e.g., candidate-hello"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nonce
                </label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="e.g., 42"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Drop Column (0-12)
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={dropColumn}
                  onChange={(e) => setDropColumn(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "✅ Verify Round"}
              </button>

              <button
                onClick={loadTestData}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                📝 Load Test Data
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div
              className={`bg-white/5 backdrop-blur-sm rounded-xl border p-6 space-y-4 ${
                result.isVerified ? "border-green-400/50" : "border-red-400/50"
              }`}
            >
              {result.error ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">❌</div>
                  <div className="text-red-400 font-semibold">
                    {result.error}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {result.isVerified ? "✅" : "❌"}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        result.isVerified ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {result.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="text-sm text-gray-400">Commit Hash</div>
                      <div className="font-mono text-xs text-white break-all">
                        {result.commitHex}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Combined Seed</div>
                      <div className="font-mono text-xs text-white break-all">
                        {result.combinedSeed}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Peg Map Hash</div>
                      <div className="font-mono text-xs text-white break-all">
                        {result.pegMapHash}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Final Bin</div>
                      <div className="text-2xl font-bold text-white">
                        {result.binIndex}
                      </div>
                    </div>
                  </div>

                  {/* Path Display */}
                  {result.path && result.path.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm text-gray-400 mb-2">
                        Ball Path ({result.path.length} steps)
                      </div>
                      <div className="font-mono text-xs text-white space-y-1 max-h-48 overflow-y-auto">
                        {result.path.map((step: any, i: number) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-gray-500">
                              Row {step.row}:
                            </span>
                            <span className="text-purple-400">
                              Col {step.col}
                            </span>
                            <span className="text-yellow-400">
                              → {step.direction}
                            </span>
                            <span className="text-gray-600 text-[10px]">
                              (bias: {step.bias.toFixed(3)}, rand:{" "}
                              {step.randValue.toFixed(3)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">
              🔐 How Verification Works
            </h2>
            <ol className="space-y-3 text-sm text-gray-300">
              <li>
                <span className="font-bold text-white">1.</span> Server
                generates{" "}
                <code className="bg-black/30 px-2 py-1 rounded">
                  serverSeed
                </code>{" "}
                and creates commit hash
              </li>
              <li>
                <span className="font-bold text-white">2.</span> You provide{" "}
                <code className="bg-black/30 px-2 py-1 rounded">
                  clientSeed
                </code>{" "}
                before playing
              </li>
              <li>
                <span className="font-bold text-white">3.</span> Combined seed =
                SHA256(serverSeed + ":" + clientSeed + ":" + nonce)
              </li>
              <li>
                <span className="font-bold text-white">4.</span> This seed feeds
                a deterministic RNG (xorshift32)
              </li>
              <li>
                <span className="font-bold text-white">5.</span> Same inputs
                always produce the same outcome
              </li>
              <li>
                <span className="font-bold text-white">6.</span> After the
                round, server reveals{" "}
                <code className="bg-black/30 px-2 py-1 rounded">
                  serverSeed
                </code>
              </li>
              <li>
                <span className="font-bold text-white">7.</span> You can verify:
                SHA256(serverSeed + ":" + nonce) = commitHash
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
