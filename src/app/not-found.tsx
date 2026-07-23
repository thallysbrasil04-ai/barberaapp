import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-stone-600 mb-8">Página não encontrada</p>
      <Link href="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
        Voltar ao Início
      </Link>
    </div>
  );
}
