import React, { useState } from "react";
import { Shield, ShieldAlert, CheckCircle, Phone, ArrowRight, Lock, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HARASSMENT_TYPES, FAQS, EXTERNAL_CHANNELS, FLOW_STEPS } from "@/lib/site-data";
import HarassmentModal from "@/components/HarassmentModal";
import ComplaintForm from "@/components/ComplaintForm";
import * as LucideIcons from "lucide-react";

const FOMENTAS_LOGO_URL = "https://fomentas.nyc3.digitaloceanspaces.com/storage/webdisco/logos/89524173c071b62d07e0f5cd408fc136_2.png";

// Mapeamento de strings de ícones para componentes Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  lP: LucideIcons.AlertTriangle,
  uP: LucideIcons.Flame,
  Xw: LucideIcons.Users,
  "$k": LucideIcons.Briefcase,
  Vk: LucideIcons.TrendingUp,
  Lk: LucideIcons.UserCheck,
  vP: LucideIcons.Laptop,
  _P: LucideIcons.ShieldAlert,
};

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 min-w-fit">
            <img
              src={FOMENTAS_LOGO_URL}
              alt="Fomentas Mining Company"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block h-6 w-[1px] bg-border" />
            <span className="text-xs sm:text-sm font-semibold text-[#0f2942] hidden sm:block">
              Canal de Denúncias – Conselho de Ética
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => handleScrollTo("inicio")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Início</button>
            <button onClick={() => handleScrollTo("sobre")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Sobre o Canal</button>
            <button onClick={() => handleScrollTo("tipos")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Tipos de Assédio</button>
            <button onClick={() => handleScrollTo("denunciar")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Denunciar</button>
            <button onClick={() => handleScrollTo("faq")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Perguntas Frequentes</button>
            <button onClick={() => handleScrollTo("contato")} className="text-sm font-medium text-[#1f3448] hover:text-[#0f2942] transition-colors cursor-pointer">Contato</button>
          </nav>

          <div className="hidden lg:block w-[170px]" />
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="relative min-h-[560px] md:min-h-[680px] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-28 h-80 w-80 rounded-full bg-[#0f2942]/5 blur-3xl" />
          <div className="absolute right-10 top-20 h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl" />
          <img
            src={FOMENTAS_LOGO_URL}
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.045] grayscale"
          />
        </div>

        <div className="container relative z-10 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700 mb-7 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              Espaço seguro e confidencial
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#0f2942] tracking-tight mb-7 leading-[1.08]">
              Sua voz é protegida. <span className="text-emerald-700">Sua denúncia é levada a sério.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A Empresa Fomentas tem tolerância zero a qualquer forma de assédio. Use este canal para relatar com segurança.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                onClick={() => handleScrollTo("denunciar")}
                size="lg"
                className="h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-9 w-full sm:w-auto shadow-xl shadow-orange-500/20"
              >
                Fazer uma denúncia agora
              </Button>
              <Button
                onClick={() => handleScrollTo("tipos")}
                variant="outline"
                size="lg"
                className="h-14 rounded-xl px-8 w-full sm:w-auto border-slate-300 bg-white/70 hover:bg-white shadow-sm font-semibold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Conheça seus direitos
              </Button>
            </div>

            {/* Safety Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { label: "Anonimato garantido", icon: "🔒" },
                { label: "Sem retaliação", icon: "🛡️" },
                { label: "Sigilo total", icon: "🤫" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white/90 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-bold text-[#0f2942]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: O QUE É ASSÉDIO */}
      <section id="sobre" className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              O que é assédio?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Em um ambiente corporativo, o assédio pode se manifestar de diversas formas, nem sempre óbvias. Com base na legislação brasileira (Código Penal, Lei nº 10.224/2001 e jurisprudência da Justiça do Trabalho), preparamos este guia para te ajudar a identificar cada tipo.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {HARASSMENT_TYPES.map((card, idx) => {
              const IconComponent = iconMap[card.icon] || Shield;
              return (
                <div
                  key={idx}
                  className="bg-card rounded-2xl border border-border p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#0f2942]/20 transition-all group"
                >
                  <div>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${card.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-[#0f2942] transition-colors">
                      {card.title}
                    </h3>
                    {/* Desc */}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  {/* Action Link */}
                  <button
                    onClick={() => setSelectedCard(card)}
                    className="text-xs font-bold text-[#0f2942] flex items-center gap-1.5 hover:underline text-left mt-auto"
                  >
                    Ver todos
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quote Block */}
          <div className="max-w-2xl mx-auto text-center mt-12">
            <blockquote className="text-sm italic text-muted-foreground bg-muted/40 px-6 py-3.5 rounded-xl border border-border">
              "Muitas vezes há sobreposição (ex.: assédio moral com conteúdo sexual ou discriminatório)."
            </blockquote>
          </div>
        </div>
      </section>

      {/* SEÇÃO: ANTES DE DENUNCIAR - DOCUMENTE */}
      <section id="tipos" className="py-16 md:py-24 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              Antes de denunciar – Documente
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Quanto mais informações você reunir, mais eficaz será a apuração.
            </p>
          </div>

          {/* Documenting Blocks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { title: "Registre datas e horários", desc: "Anote quando os episódios aconteceram", icon: "📅" },
              { title: "Identifique testemunhas", desc: "Quem mais presenciou ou sabe dos fatos", icon: "👥" },
              { title: "Salve prints, e-mails, áudios", desc: "Se possível, preserve evidências digitais", icon: "📸" },
              { title: "Descreva fatos de forma objetiva", desc: "Relate o que aconteceu, sem julgamentos", icon: "📝" }
            ].map((item, idx) => (
              <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-4">{item.icon}</span>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Alert Block */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 text-center flex items-center justify-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm font-medium text-amber-900">
                <strong>Importante:</strong> A empresa proíbe qualquer retaliação contra quem denuncia de boa-fé. Você está protegido(a).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: FORMULÁRIO DE DENÚNCIA */}
      <section id="denunciar" className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              Formulário de Denúncia
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Preencha as informações abaixo com o máximo de detalhes. Campos com * são obrigatórios.
            </p>
          </div>

          <ComplaintForm />
        </div>
      </section>

      {/* SEÇÃO: APÓS A DENÚNCIA - O QUE ACONTECE */}
      <section className="py-16 md:py-24 bg-primary/[0.03] border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              Após a denúncia – O que acontece?
            </h2>
          </div>

          {/* Flow steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 relative">
            {FLOW_STEPS.map((step, idx) => (
              <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-4 left-6 bg-[#0f2942] text-white text-xs font-bold px-3 py-1 rounded-full">
                  PASSO {idx + 1}
                </div>
                <h3 className="font-bold text-foreground text-base mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.desc}</p>
                <div className="text-xs text-[#0f2942] bg-primary/[0.04] px-3 py-2 rounded-lg border border-[#0f2942]/10 font-semibold inline-block">
                  {step.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-emerald-900">
                A Empresa Fomentas garante proteção contra retaliação e confidencialidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: PERGUNTAS FREQUENTES */}
      <section id="faq" className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="bg-card rounded-xl border border-border px-5 data-[state=open]:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* SEÇÃO: CANAIS EXTERNOS */}
      <section id="contato" className="py-16 md:py-24 bg-muted/20 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2942] mb-4">
              Canais Externos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Caso prefira não usar o canal interno, você também pode procurar estes órgãos:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {EXTERNAL_CHANNELS.map((channel, idx) => (
              <a
                key={idx}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-[#0f2942]/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-[#0f2942] transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {channel.desc}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#0f2942] flex items-center gap-1 hover:underline mt-auto">
                  Acessar
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER FINAL */}
      <section className="py-20 md:py-28 bg-[#0f2942] text-white text-center relative overflow-hidden">
        <div className="container relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Assédio não é parte do trabalho. <br />
            <span className="text-emerald-400">Denuncie com segurança.</span>
          </h2>
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Seu relato pode proteger você e outras pessoas. O Conselho de Ética da Fomentas está pronto para acolher sua denúncia.
          </p>
          <Button
            onClick={() => handleScrollTo("denunciar")}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-10 shadow-lg shadow-orange-500/20"
          >
            Fazer uma denúncia agora
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-white">Fomentas</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Mining Company</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Canal de Denúncias oficial do Conselho de Ética da Fomentas Mining Company. Canal confidencial, sigiloso e seguro.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Links Importantes</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Código de Ética</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Proteção ao Denunciante</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm">Contatos & Segurança</h4>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                E-mail: etica@fomentas.com.br
              </p>
              <div className="flex gap-2 pt-1">
                <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-800">
                  🔒 LGPD Compliant
                </span>
                <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-800">
                  🛡️ HTTPS
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} Fomentas Mining Company. Todos os direitos reservados.</p>
            <p>Conselho de Ética – Versão 1.0.0</p>
          </div>
        </div>
      </footer>

      {/* MODAL DETALHADO DE ASSÉDIO */}
      <HarassmentModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
