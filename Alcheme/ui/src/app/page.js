'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  if (authenticated) {
    return (
      <main className="min-h-screen bg-black text-white p-6 text-center">
        <h1 className="text-3xl font-bold text-purple-400">Alcheme 炼金炉</h1>
        <p className="mt-2">你的成长，炼成勋章</p>

        <div className="mt-10 flex flex-col gap-4">
          <button
            onClick={() => router.push('/mine')}
            className="bg-purple-600 py-3 px-6 rounded-xl text-lg"
          >
            🔨 采集灵光（矿石）
          </button>
          <button
            onClick={() => router.push('/smelt')}
            className="bg-blue-600 py-3 px-6 rounded-xl text-lg"
          >
            🔥 成长炼金（卡片）
          </button>
          <button
            onClick={() => router.push('/forge')}
            className="bg-yellow-600 py-3 px-6 rounded-xl text-lg"
          >
            ✨ 身份铸造（勋章）
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <button
        onClick={login}
        className="bg-purple-500 py-4 px-10 rounded-2xl text-xl"
      >
        开启炼金之旅
      </button>
    </main>
  );
}
