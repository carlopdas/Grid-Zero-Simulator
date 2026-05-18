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
  Cell,
  PieChart,
  Pie
} from "recharts"
import { TrendingUp, DollarSign, Calendar, AlertCircle, Info, Zap, Battery, Calculator, Sun, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface EconomicAnalysisProps {
  results: SimulationResults
  tariff: TariffConfig
}

export function EconomicAnalysis({ results, tariff }: EconomicAnalysisProps) {
  const [showDetails, setShowDetails] = useState(false)
  
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

  // Component breakdown data for pie chart
  const componentData = [
    { 
      name: 'Solar Direto', 
      value: economic.solarDirectSavings || 0, 
      fill: '#22c55e',
      percent: economic.monthlySavings > 0 ? ((economic.solarDirectSavings || 0) / economic.monthlySavings * 100) : 0
    },
    { 
      name: 'Bateria Solar', 
      value: economic.batterySolarSavings || 0, 
      fill: '#3b82f6',
      percent: economic.monthlySavings > 0 ? ((economic.batterySolarSavings || 0) / economic.monthlySavings * 100) : 0
    },
    { 
      name: 'Peak Shaving', 
      value: economic.peakShavingSavings || 0, 
      fill: '#8b5cf6',
      percent: economic.monthlySavings > 0 ? ((economic.peakShavingSavings || 0) / economic.monthlySavings * 100) : 0
    },
    { 
      name: 'Arbitragem', 
      value: economic.arbitrageNetSavings || 0, 
      fill: '#f59e0b',
      percent: economic.monthlySavings > 0 ? ((economic.arbitrageNetSavings || 0) / economic.monthlySavings * 100) : 0
    },
  ].filter(d => d.value > 0)

  const savingsData = [
    { name: 'Diario', valor: economic.dailySavings || (economic.monthlySavings / 30), fill: '#22c55e' },
    { name: 'Semanal', valor: (economic.dailySavings || (economic.monthlySavings / 30)) * 7, fill: '#3b82f6' },
    { name: 'Mensal', valor: economic.monthlySavings, fill: '#8b5cf6' },
    { name: 'Anual', valor: economic.annualSavings, fill: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="glass-card section-green animate-fade-in-up">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 mb-3">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Economia Diaria</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                R$ {(economic.dailySavings || economic.monthlySavings / 30).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">/dia</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card section-blue animate-fade-in-up-delay-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Economia Mensal</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                R$ {economic.monthlySavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">/mes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card section-amber animate-fade-in-up-delay-2">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 mb-3">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Economia Anual</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                R$ {economic.annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">/ano</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cap Warning/Info */}
      {economic.currentMonthlyBill > 0 && (
        <Card className={`animate-fade-in-up ${economic.savingsCapApplied ? 'border-2 border-amber-400 dark:border-amber-600' : 'border border-green-200 dark:border-green-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${economic.savingsCapApplied ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                {economic.savingsCapApplied ? (
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${economic.savingsCapApplied ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                  {economic.savingsCapApplied 
                    ? 'Teto de Economia Aplicado (95% da fatura)' 
                    : 'Economia dentro do limite realista'}
                </p>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fatura atual:</span>
                    <p className="font-semibold text-foreground">R$ {economic.currentMonthlyBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teto (95%):</span>
                    <p className="font-semibold text-foreground">R$ {(economic.currentMonthlyBill * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Economia bruta:</span>
                    <p className={`font-semibold ${economic.savingsCapApplied ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                      R$ {(economic.grossMonthlySavings || economic.monthlySavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">% da fatura:</span>
                    <p className={`font-semibold ${(economic.savingsCapPercent || 0) > 90 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                      {(economic.savingsCapPercent || (economic.monthlySavings / economic.currentMonthlyBill * 100)).toFixed(1)}%
                    </p>
                  </div>
                </div>
                {economic.savingsCapApplied && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    A economia bruta calculada foi limitada ao teto de 95% da fatura para garantir resultados realistas.
                    Considere revisar os parametros de geracao, tarifas ou consumo.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demand Reduction Info */}
      {(economic.demandReductionKw || 0) > 0 && (
        <Card className="glass-card section-purple animate-fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Peak Shaving - Reducao de Demanda</p>
                  <p className="text-xs text-muted-foreground">Demanda maxima reduzida de {(economic.originalPeakDemandKw || 0).toFixed(1)} kW para {(economic.reducedPeakDemandKw || 0).toFixed(1)} kW</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  -{(economic.demandReductionKw || 0).toFixed(1)} kW
                </p>
                <p className="text-xs text-muted-foreground">
                  x R$ {(tariff.demandRate || 0).toFixed(2)}/kW = R$ {(economic.peakShavingSavings || 0).toFixed(2)}/mes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Economy by Component */}
      <Card className="glass-card border-0 animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            Economia por Componente
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Detalhamento das fontes de economia mensal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={componentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${percent.toFixed(0)}%`}
                    labelLine={false}
                  >
                    {componentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Component Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-foreground">Solar Direto</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {(economic.solarDirectSavings || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{(economic.dailySolarDirectKwh || 0).toFixed(0)} kWh/dia</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-foreground">Bateria (Solar)</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {(economic.batterySolarSavings || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{(economic.dailyBatterySolarKwh || 0).toFixed(0)} kWh/dia</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-foreground">Peak Shaving</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {(economic.peakShavingSavings || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Reducao de demanda</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-foreground">Arbitragem</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {(economic.arbitrageNetSavings || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{(economic.dailyArbitrageDischargeKwh || 0).toFixed(0)} kWh/dia</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-200 dark:border-green-800">
                <span className="text-sm font-bold text-foreground">TOTAL MENSAL</span>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">R$ {economic.monthlySavings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Details Card */}
      {(economic.arbitrageNetSavings || 0) !== 0 && (
        <Card className="glass-card section-amber animate-fade-in-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <ArrowUpDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Detalhamento da Arbitragem de Tarifa
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Compra na tarifa fora ponta, consumo na tarifa ponta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Custo da Compra (Fora Ponta)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energia comprada:</span>
                    <span className="font-medium text-foreground">{((economic.dailyArbitrageChargeKwh || 0) * 30).toFixed(0)} kWh/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarifa fora ponta:</span>
                    <span className="font-medium text-foreground">R$ {tariff.offPeakRate.toFixed(2)}/kWh</span>
                  </div>
                  <div className="flex justify-between border-t border-red-200 dark:border-red-800 pt-1 mt-2">
                    <span className="font-semibold text-foreground">Custo total:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">R$ {(economic.arbitrageCost || 0).toFixed(2)}/mes</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Beneficio da Descarga (Ponta)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energia descarregada:</span>
                    <span className="font-medium text-foreground">{((economic.dailyArbitrageDischargeKwh || 0) * 30).toFixed(0)} kWh/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarifa ponta:</span>
                    <span className="font-medium text-foreground">R$ {tariff.peakRate.toFixed(2)}/kWh</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-1 mt-2">
                    <span className="font-semibold text-foreground">Beneficio total:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">R$ {(economic.arbitrageBenefit || 0).toFixed(2)}/mes</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-100 to-green-100 dark:from-amber-900/30 dark:to-green-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Lucro Liquido da Arbitragem</p>
                  <p className="text-xs text-muted-foreground">Beneficio - Custo = Lucro</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R$ {(economic.arbitrageNetSavings || 0).toFixed(2)}/mes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((economic.arbitrageBenefit || 0) / (economic.arbitrageCost || 1) * 100 - 100).toFixed(0)}% de retorno sobre custo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formula Expandable */}
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <Card className="glass-card border-0 animate-fade-in-up">
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  Ver Detalhamento do Calculo
                </CardTitle>
                {showDetails ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="rounded-xl bg-secondary p-4 font-mono text-sm">
                <p className="text-foreground leading-relaxed">
                  <span className="font-bold text-amber-600 dark:text-amber-400">Economia Mensal</span> = 
                  <span className="text-green-600 dark:text-green-400"> Eco_Solar_Direto</span> +
                  <span className="text-blue-600 dark:text-blue-400"> Eco_Bateria_Solar</span> +
                  <span className="text-purple-600 dark:text-purple-400"> Eco_Peak_Shaving</span> +
                  <span className="text-amber-600 dark:text-amber-400"> Eco_Arbitragem</span>
                </p>
              </div>
              
              <div className="space-y-2 text-sm rounded-lg bg-secondary/50 p-4">
                <p className="font-semibold text-foreground mb-3">Calculo com valores atuais:</p>
                
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-green-600 dark:text-green-400">Eco_Solar_Direto</span>
                  <span className="text-foreground">
                    {(economic.dailySolarDirectKwh || 0).toFixed(0)} kWh/dia × 30 × R${((tariff.peakRate + tariff.offPeakRate) / 2).toFixed(2)} = 
                    <strong> R$ {(economic.solarDirectSavings || 0).toFixed(2)}</strong>
                  </span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-blue-600 dark:text-blue-400">Eco_Bateria_Solar</span>
                  <span className="text-foreground">
                    {(economic.dailyBatterySolarKwh || 0).toFixed(0)} kWh/dia × 30 × R${((tariff.peakRate + tariff.offPeakRate) / 2).toFixed(2)} = 
                    <strong> R$ {(economic.batterySolarSavings || 0).toFixed(2)}</strong>
                  </span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-purple-600 dark:text-purple-400">Eco_Peak_Shaving</span>
                  <span className="text-foreground">
                    <strong>R$ {(economic.peakShavingSavings || 0).toFixed(2)}</strong>
                  </span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-amber-600 dark:text-amber-400">Eco_Arbitragem</span>
                  <span className="text-foreground">
                    R$ {(economic.arbitrageBenefit || 0).toFixed(2)} - R$ {(economic.arbitrageCost || 0).toFixed(2)} = 
                    <strong> R$ {(economic.arbitrageNetSavings || 0).toFixed(2)}</strong>
                  </span>
                </div>
                
                <div className="flex justify-between py-2 mt-2 rounded bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 px-2">
                  <span className="font-bold text-foreground">TOTAL</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    R$ {economic.monthlySavings.toFixed(2)}/mes
                  </span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Savings Chart */}
      <Card className="glass-card border-0 animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Projecao de Economia</CardTitle>
          <CardDescription className="text-muted-foreground">
            Estimativa de economia em diferentes periodos
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
    </div>
  )
}
