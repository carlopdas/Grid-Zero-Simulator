"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationResults, TariffConfig } from "@/lib/grid-zero-types"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  Cell
} from "recharts"
import { TrendingUp, DollarSign, Calendar, AlertCircle, Info, Zap, Battery, Calculator } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface EconomicAnalysisProps {
  results: SimulationResults
  tariff: TariffConfig
}

export function EconomicAnalysis({ results, tariff }: EconomicAnalysisProps) {
  if (!tariff.enabled) {
    return (
      <Card className="glass-card section-blue animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Analise Economica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">
              Tarifas nao configuradas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure as tarifas na aba correspondente para visualizar a analise economica
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const economic = results.economic

  const savingsData = [
    { name: 'Diário', valor: economic.monthlySavings / 30, fill: 'oklch(0.55 0.18 145)' },
    { name: 'Semanal', valor: (economic.monthlySavings / 30) * 7, fill: 'oklch(0.6 0.16 145)' },
    { name: 'Mensal', valor: economic.monthlySavings, fill: 'oklch(0.65 0.14 145)' },
    { name: 'Anual', valor: economic.annualSavings, fill: 'oklch(0.5 0.15 250)' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards with Explanatory Tooltips */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="glass-card section-green animate-fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Economia Mensal</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Valor economizado na conta de luz no mes, comparando cenario com bateria vs sem bateria. Calculado com base nas tarifas configuradas.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xl font-bold text-foreground">R$ {economic.monthlySavings.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card section-green animate-fade-in-up-delay-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Economia Anual</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Soma das economias mensais em 12 meses. Representa o total economizado anualmente com o sistema solar + bateria.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xl font-bold text-foreground">R$ {economic.annualSavings.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card section-blue animate-fade-in-up-delay-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Peak Shaving</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Reducao dos picos de demanda da rede, evitando custos extras por alta potencia contratada. A bateria descarrega nos horarios de pico.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xl font-bold text-foreground">R$ {economic.peakShavingSavings.toFixed(0)}/mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card section-blue animate-fade-in-up-delay-3">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Energia Economizada</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Total de kWh que deixaram de ser importados da rede gracas a bateria + geracao solar. Energia produzida e consumida localmente.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xl font-bold text-foreground">{economic.gridEnergySaved.toFixed(1)} kWh/dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Chart */}
      <Card className="glass-card border-0 animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Projeção de Economia</CardTitle>
          <CardDescription className="text-muted-foreground">
            Estimativa de economia em diferentes períodos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                  className="fill-muted-foreground"
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--card-foreground)'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Economia']}
                />
                <Legend />
                <Bar dataKey="valor" name="Economia (R$)" radius={[4, 4, 0, 0]}>
                  {savingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="glass-card border-0 animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Detalhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Geração Solar Útil</span>
              <span className="font-medium text-foreground">{results.selfConsumption.toFixed(1)} kWh/dia</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Energia da Bateria</span>
              <span className="font-medium text-foreground">{results.dischargedEnergy.toFixed(1)} kWh/dia</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Tarifa Média Evitada</span>
              <span className="font-medium text-foreground">
                R$ {economic.gridEnergySaved > 0 
                  ? ((economic.monthlySavings / 30) / economic.gridEnergySaved).toFixed(2) 
                  : '0.00'}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Economia por kWh Gerado</span>
              <span className="font-medium text-foreground">
                R$ {results.totalGenerated > 0 
                  ? ((economic.monthlySavings / 30) / results.totalGenerated).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-foreground">Total Economizado (Mensal)</span>
              <span className="gradient-value text-xl font-bold">
                R$ {economic.monthlySavings.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Card */}
      <Card className="glass-card section-amber animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Calculator className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Formula da Economia Mensal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Metodologia de calculo utilizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-secondary p-4 font-mono text-sm">
            <p className="text-foreground">
              <span className="font-bold text-amber-600 dark:text-amber-400">Economia Mensal</span> = 
              <span className="text-green-600 dark:text-green-400"> (Energia Solar Autoconsumida x Tarifa Media)</span> +
              <span className="text-blue-600 dark:text-blue-400"> (Energia Bateria Descarregada x Tarifa Evitada)</span> +
              <span className="text-purple-600 dark:text-purple-400"> (Peak Shaving x Demanda Contratada)</span> -
              <span className="text-red-600 dark:text-red-400"> (Energia Arbitragem x Tarifa Fora Ponta)</span>
            </p>
          </div>
          
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="space-y-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="font-semibold text-green-700 dark:text-green-400">Energia Solar Autoconsumida</p>
              <p className="text-muted-foreground">kWh gerados e consumidos instantaneamente</p>
              <p className="font-medium text-foreground">{results.selfConsumption.toFixed(1)} kWh/dia</p>
            </div>
            
            <div className="space-y-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
              <p className="font-semibold text-blue-700 dark:text-blue-400">Energia da Bateria Descarregada</p>
              <p className="text-muted-foreground">kWh armazenados e depois utilizados</p>
              <p className="font-medium text-foreground">{results.dischargedEnergy.toFixed(1)} kWh/dia</p>
            </div>
            
            <div className="space-y-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3">
              <p className="font-semibold text-purple-700 dark:text-purple-400">Peak Shaving</p>
              <p className="text-muted-foreground">Economia por reducao de demanda ponta</p>
              <p className="font-medium text-foreground">R$ {economic.peakShavingSavings.toFixed(2)}/mes</p>
            </div>
            
            <div className="space-y-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="font-semibold text-amber-700 dark:text-amber-400">Arbitragem de Tarifa</p>
              <p className="text-muted-foreground">Economia compra FP / venda Ponta</p>
              <p className="font-medium text-foreground">R$ {(economic.arbitrageSavings || 0).toFixed(2)}/mes</p>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-4">
            <p className="text-xs text-muted-foreground uppercase mb-1">Exemplo de Calculo (valores atuais)</p>
            <p className="text-sm text-foreground">
              ({results.selfConsumption.toFixed(0)} kWh x R${tariff.offPeakRate.toFixed(2)}) + 
              ({results.dischargedEnergy.toFixed(0)} kWh x R${tariff.peakRate.toFixed(2)}) + 
              R${economic.peakShavingSavings.toFixed(0)} - R${(economic.arbitrageSavings || 0).toFixed(0)} = 
              <span className="font-bold text-green-600 dark:text-green-400"> R$ {(economic.monthlySavings / 30).toFixed(2)}/dia</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
