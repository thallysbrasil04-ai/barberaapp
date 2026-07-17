"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Erro</h1>
      <p className="text-lg text-neutral-600 mb-8">Algo deu errado. Tente novamente.</p>
      <button
        onClick={reset}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
