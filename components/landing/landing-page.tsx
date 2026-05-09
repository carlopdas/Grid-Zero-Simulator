"use client"

import { Button } from "@/components/ui/button"
import { 
  Battery, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Shield,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 lg:px-8 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#2563EB]/5 blur-3xl" />
        <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#2563EB]/5 blur-3xl" />
      </div>
      
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 px-4 py-2 text-sm font-medium text-[#2563EB] mb-6">
              <Zap className="h-4 w-4" />
              Plataforma de Dimensionamento BESS
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl xl:text-7xl">
              Dimensione sistemas de{" "}
              <span className="text-[#2563EB]">armazenamento de energia</span>{" "}
              com precisao
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-[#64748B] max-w-xl mx-auto lg:mx-0">
              Simule, analise e otimize projetos de baterias e sistemas fotovoltaicos 
              com nossa plataforma de engenharia de precisao.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/simulator">
                <Button 
                  size="lg" 
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-base rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#2563EB]/25"
                >
                  Acessar Simulador
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] px-8 py-6 text-base rounded-xl"
              >
                Solicitar Demo
              </Button>
            </div>
          </div>
          
          {/* Right content - Platform mockup */}
          <div className="relative">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E2E8F0] p-4 shadow-2xl shadow-[#0F172A]/5">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 pb-4 border-b border-[#E2E8F0]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                  <div className="h-3 w-3 rounded-full bg-[#22C55E]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#F1F5F9] rounded-lg px-4 py-1.5 text-xs text-[#64748B]">
                    bess-platform.vercel.app
                  </div>
                </div>
              </div>
              
              {/* Dashboard preview */}
              <div className="mt-4 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Energia Gerada", value: "156.2 kWh", color: "#22C55E" },
                    { label: "Autoconsumo", value: "94.7%", color: "#2563EB" },
                    { label: "ROI Estimado", value: "18.3%", color: "#8B5CF6" },
                  ].map((kpi, i) => (
                    <div key={i} className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                      <p className="text-[10px] text-[#64748B] uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Chart placeholder */}
                <div className="rounded-xl bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E2E8F0] p-4 h-40">
                  <div className="flex items-end justify-between h-full gap-2">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                        <div 
                          className="rounded-sm bg-gradient-to-t from-[#2563EB] to-[#60A5FA]" 
                          style={{ height: `${h}%` }}
                        />
                        <div 
                          className="rounded-sm bg-[#F59E0B]/30" 
                          style={{ height: `${h * 0.3}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl border border-[#E2E8F0] shadow-lg p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Simulacao completa</p>
                <p className="text-xs text-[#64748B]">em menos de 2 segundos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Key Metrics Section
function MetricsSection() {
  const metrics = [
    {
      value: "98.5%",
      label: "Precisao nas Simulacoes",
      description: "Validado com dados reais de projetos instalados"
    },
    {
      value: "2.4x",
      label: "Retorno Medio de ROI",
      description: "Em projetos dimensionados com nossa plataforma"
    },
    {
      value: "< 3min",
      label: "Tempo de Analise",
      description: "Do input de dados ao relatorio completo"
    }
  ]
  
  return (
    <section className="bg-[#F8FAFC] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((metric, i) => (
            <div 
              key={i} 
              className="relative bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <p className="text-4xl font-bold text-[#2563EB] lg:text-5xl">{metric.value}</p>
              <p className="mt-2 text-lg font-semibold text-[#0F172A]">{metric.label}</p>
              <p className="mt-2 text-sm text-[#64748B]">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Battery,
      title: "Dimensionamento BESS",
      description: "Calcule a capacidade ideal de baterias considerando perfil de carga, tarifas e restricoes operacionais."
    },
    {
      icon: BarChart3,
      title: "Analise Economica",
      description: "Projete economia, payback e ROI com modelos financeiros detalhados e cenarios comparativos."
    },
    {
      icon: TrendingUp,
      title: "Simulacao Grid Zero",
      description: "Simule operacao em modo ilha com zero exportacao, otimizando autoconsumo e curtailment."
    },
    {
      icon: Shield,
      title: "Relatorios Tecnicos",
      description: "Gere documentacao profissional pronta para apresentar a clientes e investidores."
    }
  ]
  
  return (
    <section className="bg-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Tudo que voce precisa para dimensionar projetos BESS
          </h2>
          <p className="mt-4 text-lg text-[#64748B]">
            Ferramentas profissionais de engenharia em uma interface intuitiva
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group relative bg-[#F8FAFC] rounded-2xl p-6 transition-all hover:bg-white hover:shadow-lg hover:shadow-[#0F172A]/5 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                <feature.icon className="h-6 w-6 text-[#2563EB] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Configure os Dados",
      description: "Insira o perfil de consumo, geracao FV e especificacoes da bateria"
    },
    {
      number: "02",
      title: "Execute a Simulacao",
      description: "Nossa engine calcula fluxos de energia hora a hora com alta precisao"
    },
    {
      number: "03",
      title: "Analise os Resultados",
      description: "Visualize KPIs, graficos interativos e exporte relatorios completos"
    }
  ]
  
  return (
    <section className="bg-[#F8FAFC] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-lg text-[#64748B]">
            Tres passos simples para dimensionar seu projeto
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#2563EB]/20 to-transparent" />
              )}
              <div className="relative bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-sm text-[#64748B]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Social Proof Section
function SocialProofSection() {
  const companies = [
    "Energia Solar Co.",
    "GreenPower",
    "SunTech Brasil",
    "EcoBattery",
    "PowerGrid Solutions"
  ]
  
  return (
    <section className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-medium text-[#64748B] uppercase tracking-wider mb-8">
          Utilizado por empresas líderes do setor
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {companies.map((company, i) => (
            <div key={i} className="text-xl font-bold text-[#94A3B8] hover:text-[#64748B] transition-colors">
              {company}
            </div>
          ))}
        </div>
        
        {/* Testimonial */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center">
            <p className="text-lg text-[#0F172A] italic leading-relaxed">
              &quot;A BESS Sizing Platform reduziu nosso tempo de analise de projetos em 80%. 
              A precisao das simulacoes e a qualidade dos relatorios impressionam nossos clientes.&quot;
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                <span className="text-lg font-bold text-[#2563EB]">RC</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#0F172A]">Ricardo Costa</p>
                <p className="text-sm text-[#64748B]">Diretor de Engenharia, SunTech Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="bg-[#0F172A] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Pronto para dimensionar seu proximo projeto?
        </h2>
        <p className="mt-6 text-lg text-[#94A3B8]">
          Acesse nossa plataforma gratuitamente e descubra como otimizar seus projetos de armazenamento de energia.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/simulator">
            <Button 
              size="lg" 
              className="bg-[#2563EB] hover:bg-[#3B82F6] text-white px-8 py-6 text-base rounded-xl transition-all hover:scale-105"
            >
              Comecar Agora
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-[#334155] text-white hover:bg-[#1E293B] px-8 py-6 text-base rounded-xl"
          >
            Agendar Demonstracao
          </Button>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <Battery className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">BESS Sizing Platform</span>
          </div>
          
          <nav className="flex gap-8">
            <a href="#" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Recursos</a>
            <a href="#" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Precos</a>
            <a href="#" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Documentacao</a>
            <a href="#" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Contato</a>
          </nav>
          
          <p className="text-sm text-[#64748B]">
            2024 BESS Sizing Platform. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Navbar
function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Battery className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0F172A]">BESS Platform</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Recursos</a>
            <a href="#" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Precos</a>
            <a href="#" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Documentacao</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/simulator">
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// Main Landing Page Component
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
