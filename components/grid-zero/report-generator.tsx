"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  SimulationResults, 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  TariffConfig,
  AnalysisMode 
} from "@/lib/grid-zero-types"
import { FileText, Download, Printer, CheckCircle2 } from "lucide-react"

interface ReportGeneratorProps {
  results: SimulationResults
  consumption: ConsumptionProfile
  generation: GenerationData
  battery: BatteryConfig
  tariff: TariffConfig
  analysisMode: AnalysisMode
}

export function ReportGenerator({ 
  results, 
  consumption, 
  generation, 
  battery, 
  tariff,
  analysisMode 
}: ReportGeneratorProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const reportData = {
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      modoAnalise: analysisMode,
      consumo: {
        perfil: consumption.type,
        diario: consumption.dailyConsumption,
        mensal: consumption.monthlyConsumption,
        anual: consumption.annualConsumption
      },
      geracao: {
        potenciaInstalada: generation.installedPower,
        performanceRatio: generation.performanceRatio,
        irradianciaMedia: generation.irradiance.annualAverage,
        geracaoDiaria: generation.hourlyGeneration.reduce((a, b) => a + b, 0)
      },
      bateria: battery.enabled ? {
        capacidade: battery.capacity,
        quantidade: battery.quantity,
        capacidadeTotal: battery.capacity * battery.quantity,
        eficiencia: battery.efficiency,
        dod: battery.dod
      } : null,
      resultados: {
        energiaGerada: results.totalGenerated,
        energiaConsumida: results.totalConsumed,
        autoconsumo: results.selfConsumptionPercent,
        energiaCurtailed: results.curtailedEnergy,
        independenciaEnergetica: results.energyIndependence,
        energiaArmazenada: results.storedEnergy,
        energiaDescarregada: results.dischargedEnergy
      },
      economico: tariff.enabled ? {
        economiaMensal: results.economic.monthlySavings,
        economiaAnual: results.economic.annualSavings,
        peakShaving: results.economic.peakShavingSavings
      } : null,
      dimensionamento: results.sizing
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-bess-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const analysisModeLabels = {
    'load-only': 'Apenas Carga',
    'pv-only': 'Somente Fotovoltaico',
    'pv-bess': 'Fotovoltaico + BESS'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-0 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            Relatório Técnico
          </CardTitle>
          <CardDescription className="text-slate-400">
            Resumo completo da simulação BESS
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleExport} className="btn-gradient rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="print:p-8" id="report-content">
        {/* Header Info */}
        <Card className="glass-card border-0 print:border print:shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">BESS Sizing Platform</CardTitle>
                <CardDescription className="text-base text-slate-400">
                  Relatório de Dimensionamento e Análise
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm border-white/20 text-white">
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Configuration */}
        <Card className="glass-card border-0 mt-4 print:border print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Configuração do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400">Modo de Análise</p>
                <p className="font-medium text-white">{analysisModeLabels[analysisMode]}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Perfil de Carga</p>
                <p className="font-medium capitalize text-white">{consumption.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Potência FV</p>
                <p className="font-medium text-white">{generation.installedPower} kWp</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Bateria</p>
                <p className="font-medium text-white">
                  {battery.enabled 
                    ? `${battery.quantity}x ${battery.capacity} kWh` 
                    : 'Desabilitada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card className="glass-card border-0 mt-4 print:border print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Resultados da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm text-slate-400">Energia Gerada</p>
                </div>
                <p className="gradient-value mt-1 text-2xl font-bold">{results.totalGenerated.toFixed(1)} kWh/dia</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <p className="text-sm text-slate-400">Energia Consumida</p>
                </div>
                <p className="gradient-value mt-1 text-2xl font-bold">{results.totalConsumed.toFixed(1)} kWh/dia</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <p className="text-sm text-slate-400">Autoconsumo</p>
                </div>
                <p className="gradient-value mt-1 text-2xl font-bold">{results.selfConsumptionPercent.toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-slate-400">Energia Curtailed</p>
                </div>
                <p className="gradient-value mt-1 text-2xl font-bold">{results.curtailedEnergy.toFixed(1)} kWh</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <p className="text-sm text-slate-400">Independência</p>
                </div>
                <p className="gradient-value mt-1 text-2xl font-bold">{results.energyIndependence.toFixed(1)}%</p>
              </div>
              {battery.enabled && (
                <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm text-slate-400">Bateria Utilizada</p>
                  </div>
                  <p className="gradient-value mt-1 text-2xl font-bold">{results.dischargedEnergy.toFixed(1)} kWh</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sizing Results */}
        {battery.enabled && (
          <Card className="glass-card border-0 mt-4 print:border print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Dimensionamento BESS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-400">Energia Requerida</p>
                  <p className="gradient-value text-xl font-bold">{results.sizing.requiredEnergy.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Energia Corrigida</p>
                  <p className="gradient-value text-xl font-bold">{results.sizing.correctedEnergy.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Capacidade Total</p>
                  <p className="gradient-value text-xl font-bold">{results.sizing.totalCapacity.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Potência Requerida</p>
                  <p className="gradient-value text-xl font-bold">{results.sizing.requiredPower.toFixed(1)} kW</p>
                </div>
              </div>
              
              {results.sizing.warnings.length > 0 && (
                <div className="mt-4 rounded-2xl bg-red-500/10 p-4">
                  <p className="mb-2 font-medium text-red-400">Avisos:</p>
                  <ul className="list-inside list-disc text-sm text-red-300">
                    {results.sizing.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Economic Analysis */}
        {tariff.enabled && (
          <Card className="glass-card border-0 mt-4 print:border print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Análise Econômica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-400">Economia Mensal</p>
                  <p className="gradient-value text-xl font-bold">
                    R$ {results.economic.monthlySavings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Economia Anual</p>
                  <p className="gradient-value text-xl font-bold">
                    R$ {results.economic.annualSavings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Peak Shaving</p>
                  <p className="gradient-value text-xl font-bold">
                    R$ {results.economic.peakShavingSavings.toFixed(2)}/mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-sm text-slate-500 print:mt-12">
          <p>BESS Sizing Platform - Relatório gerado automaticamente</p>
          <p>{new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}
