import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Star, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-red-200 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            BarberApp
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.12),transparent_50%)]" />
          <div className="relative max-w-5xl mx-auto py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-sm text-red-400 mb-6">
              <Star className="h-3.5 w-3.5" />
              Agende online, sem filas
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Seu estilo,<br />
              <span className="text-red-500">nosso compromisso</span>
            </h1>
            <p className="text-lg text-neutral-400 mb-10 max-w-lg mx-auto">
              Agende seu horário com os melhores barbeiros da cidade. Rápido, fácil e sem filas.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/agendamento">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-base px-10 shadow-lg shadow-red-600/25">
                  Agendar Horário
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg" className="text-base px-10">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Por que escolher a BarberApp?</h2>
              <p className="text-neutral-500">Agende, apareça e saia estiloso</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Scissors, title: "+8 Serviços", desc: "Corte, barba, hidratação e combos" },
                { icon: Calendar, title: "Agende Online", desc: "Escolha o melhor horário para você" },
                { icon: Star, title: "Melhores Profissionais", desc: "Barbeiros experientes e certificados" },
              ].map((item) => (
                <div key={item.title} className="text-center p-8 rounded-xl border border-neutral-100 bg-neutral-50 hover:border-red-200 hover:bg-red-50/30 transition-all group">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <item.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{item.title}</h3>
                  <p className="text-neutral-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-neutral-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">Pronto para transformar seu visual?</h2>
            <Link href="/agendamento">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-base px-12 shadow-lg shadow-red-600/25">
                Agende Agora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-400">
        <p>&copy; 2026 BarberApp. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
