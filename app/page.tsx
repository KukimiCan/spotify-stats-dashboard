import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 selection:bg-green-500/30">
      <div className="w-full max-w-[1600px] mx-auto">
        <Dashboard />
      </div>
    </main>
  );
}
