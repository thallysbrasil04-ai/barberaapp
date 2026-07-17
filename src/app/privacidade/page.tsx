import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-red-600 hover:underline text-sm mb-6 inline-block">Voltar</Link>
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-neutral-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Coleta de Dados</h2>
            <p>Coletamos os seguintes dados pessoais para funcionamento do sistema:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>CPF (opcional)</li>
              <li>Histórico de agendamentos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Finalidade dos Dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gerenciar agendamentos de serviços</li>
              <li>Comunicação sobre horários agendados</li>
              <li>Melhoria dos serviços oferecidos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Compartilhamento</h2>
            <p>Não compartilhamos seus dados com terceiros. As informações são acessíveis apenas pelos profissionais da barbearia e por você.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Exclusão de Dados</h2>
            <p>Você pode solicitar a exclusão dos seus dados a qualquer momento através da página de configurações do sistema. Após a solicitação, seus dados serão anonimizados em até 15 dias.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Retenção de Dados</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão, os dados são anonimizados, preservando apenas registros de agendamentos sem identificação pessoal.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Segurança</h2>
            <p>Utilizamos criptografia para proteger seus dados e seguimos as melhores práticas de segurança da informação.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contato</h2>
            <p>Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo e-mail: contato@barberapp.com</p>
          </section>

          <p className="text-sm text-neutral-400 mt-8">Última atualização: Julho de 2026</p>
        </div>
      </div>
    </div>
  );
}
