import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-extrabold mb-4">SM Omni Agent</h1>
      <p className="text-xl text-gray-400">Intelligent AI Automation for Healthcare</p>
      <Link href="/dashboard" className="mt-10 px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-500 transition font-bold">
        Access Dashboard
      </Link>
    </main>
  );
}