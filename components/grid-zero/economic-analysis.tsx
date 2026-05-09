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
  Tooltip, 
  Legend,
  Cell
} from "recharts"
import { TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react"

interface EconomicAnalysisProps {
  results: SimulationResults
  tariff: TariffConfig
}

export function EconomicAnalysis({ results, tariff }: EconomicAnalysisProps) {
  if (!tariff.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Análise Econômica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Tarifas não configuradas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure as tarifas na aba correspondente para visualizar a análise econômica
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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-battery/10">
                <DollarSign className="h-5 w-5 text-battery" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Economia Mensal</p>
                <p className="text-xl font-bold">R$ {economic.monthlySavings.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-solar/10">
                <Calendar className="h-5 w-5 text-solar" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Economia Anual</p>
                <p className="text-xl font-bold">R$ {economic.annualSavings.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peak Shaving</p>
                <p className="text-xl font-bold">R$ {economic.peakShavingSavings.toFixed(0)}/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-load/10">
                <DollarSign className="h-5 w-5 text-load" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Energia Economizada</p>
                <p className="text-xl font-bold">{economic.gridEnergySaved.toFixed(1)} kWh/dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Projeção de Economia</CardTitle>
          <CardDescription>
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
                <Tooltip 
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Detalhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Geração Solar Útil</span>
              <span className="font-medium">{results.selfConsumption.toFixed(1)} kWh/dia</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Energia da Bateria</span>
              <span className="font-medium">{results.dischargedEnergy.toFixed(1)} kWh/dia</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Tarifa Média Evitada</span>
              <span className="font-medium">
                R$ {economic.gridEnergySaved > 0 
                  ? ((economic.monthlySavings / 30) / economic.gridEnergySaved).toFixed(2) 
                  : '0.00'}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Economia por kWh Gerado</span>
              <span className="font-medium">
                R$ {results.totalGenerated > 0 
                  ? ((economic.monthlySavings / 30) / results.totalGenerated).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold">Total Economizado (Mensal)</span>
              <span className="text-xl font-bold text-battery">
                R$ {economic.monthlySavings.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
