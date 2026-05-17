"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EconomicResults, InvestmentConfig } from "@/lib/grid-zero-types"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  ReferenceLine,
  Area,
  ComposedChart
} from "recharts"
import { Calculator, TrendingUp, DollarSign, Clock, Target, Percent } from "lucide-react"

interface InvestmentAnalysisProps {
  economic: EconomicResults
  investment: InvestmentConfig
  onInvestmentChange: (investment: InvestmentConfig) => void
}

// Calculate IRR using Newton-Raphson method
function calculateIRR(cashFlows: number[], guess: number = 0.1, maxIterations: number = 100, tolerance: number = 0.0001): number {
  let rate = guess
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let derivative = 0
    
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j)
      if (j > 0) {
        derivative -= j * cashFlows[j] / Math.pow(1 + rate, j + 1)
      }
    }
    
    if (Math.abs(npv) < tolerance) {
      return rate * 100 // Return as percentage
    }
    
    if (derivative === 0) break
    rate = rate - npv / derivative
    
    // Prevent unrealistic rates
    if (rate < -1 || rate > 10) {
      rate = guess
    }
  }
  
  return rate * 100
}

// Calculate NPV
function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((npv, cf, i) => {
    return npv + cf / Math.pow(1 + discountRate / 100, i)
  }, 0)
}

export function InvestmentAnalysis({ economic, investment, onInvestmentChange }: InvestmentAnalysisProps) {
  const annualSavings = economic.annualSavings || 0
  const totalInvestment = investment.totalInvestment || 0
  const maintenanceCost = investment.annualMaintenanceCost || 0
  const interestRate = investment.annualInterestRate || 8
  const lifespan = investment.systemLifespan || 25
  const tariffInflation = investment.tariffInflation || 3
  
  // Generate cash flows
  const cashFlows: number[] = [-totalInvestment]
  const cumulativeCashFlow: number[] = [-totalInvestment]
  const npvCumulativeCashFlow: number[] = [-totalInvestment]
  
  for (let year = 1; year <= lifespan; year++) {
    // Savings increase with tariff inflation
    const adjustedSavings = annualSavings * Math.pow(1 + tariffInflation / 100, year - 1)
    const netCashFlow = adjustedSavings - maintenanceCost
    cashFlows.push(netCashFlow)
    cumulativeCashFlow.push(cumulativeCashFlow[year - 1] + netCashFlow)
    
    // NPV cumulative
    const discountedCF = netCashFlow / Math.pow(1 + interestRate / 100, year)
    npvCumulativeCashFlow.push(npvCumulativeCashFlow[year - 1] + discountedCF)
  }
  
  // Calculate metrics
  const simplePayback = totalInvestment > 0 && annualSavings > maintenanceCost
    ? totalInvestment / (annualSavings - maintenanceCost)
    : 0
    
  // Find discounted payback (year when NPV cumulative becomes positive)
  let discountedPayback = lifespan
  for (let i = 1; i < npvCumulativeCashFlow.length; i++) {
    if (npvCumulativeCashFlow[i] >= 0) {
      // Linear interpolation for more accurate payback
      const prev = npvCumulativeCashFlow[i - 1]
      const curr = npvCumulativeCashFlow[i]
      discountedPayback = i - 1 + Math.abs(prev) / (curr - prev)
      break
    }
  }
  
  const irr = totalInvestment > 0 ? calculateIRR(cashFlows) : 0
  const npv = totalInvestment > 0 ? calculateNPV(cashFlows, interestRate) : 0
  
  // Total savings over lifespan
  const totalSavings = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0)
  const roi = totalInvestment > 0 ? ((totalSavings - totalInvestment) / totalInvestment) * 100 : 0
  
  // Prepare chart data
  const chartData = Array.from({ length: lifespan + 1 }, (_, i) => ({
    ano: i,
    'Fluxo Acumulado': Math.round(cumulativeCashFlow[i]),
    'Fluxo Descontado': Math.round(npvCumulativeCashFlow[i])
  }))
  
  return (
    <Card className="glass-card section-purple animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Calculator className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          Analise de Investimento
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Calcule payback, TIR, VPL e ROI do seu sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="totalInvestment">Investimento Total (R$)</Label>
            <Input
              id="totalInvestment"
              type="number"
              min={0}
              step={1000}
              value={investment.totalInvestment || ''}
              onChange={(e) => onInvestmentChange({ ...investment, totalInvestment: parseFloat(e.target.value) || 0 })}
              placeholder="500000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenanceCost">Manutencao Anual (R$)</Label>
            <Input
              id="maintenanceCost"
              type="number"
              min={0}
              step={100}
              value={investment.annualMaintenanceCost || ''}
              onChange={(e) => onInvestmentChange({ ...investment, annualMaintenanceCost: parseFloat(e.target.value) || 0 })}
              placeholder="5000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Taxa de Juros (% a.a.)</Label>
            <Input
              id="interestRate"
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={investment.annualInterestRate || ''}
              onChange={(e) => onInvestmentChange({ ...investment, annualInterestRate: parseFloat(e.target.value) || 0 })}
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lifespan">Vida Util (anos)</Label>
            <Input
              id="lifespan"
              type="number"
              min={1}
              max={40}
              step={1}
              value={investment.systemLifespan || ''}
              onChange={(e) => onInvestmentChange({ ...investment, systemLifespan: parseInt(e.target.value) || 25 })}
              placeholder="25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inflation">Inflacao Tarifa (% a.a.)</Label>
            <Input
              id="inflation"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={investment.tariffInflation || ''}
              onChange={(e) => onInvestmentChange({ ...investment, tariffInflation: parseFloat(e.target.value) || 0 })}
              placeholder="3"
            />
          </div>
        </div>
        
        {/* Results Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-muted-foreground">Payback Simples</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {simplePayback > 0 && simplePayback <= lifespan ? simplePayback.toFixed(1) : '-'} anos
            </p>
          </div>
          
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
            <Target className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-xs text-muted-foreground">Payback Descontado</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {discountedPayback > 0 && discountedPayback <= lifespan ? discountedPayback.toFixed(1) : '-'} anos
            </p>
          </div>
          
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <Percent className="mx-auto mb-1 h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-xs text-muted-foreground">TIR</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {irr > 0 ? irr.toFixed(1) : '-'}%
            </p>
          </div>
          
          <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4 text-center">
            <DollarSign className="mx-auto mb-1 h-5 w-5 text-purple-600 dark:text-purple-400" />
            <p className="text-xs text-muted-foreground">VPL</p>
            <p className={`text-xl font-bold ${npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              R$ {npv >= 0 ? '' : '-'}{Math.abs(npv / 1000).toFixed(0)}k
            </p>
          </div>
          
          <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-teal-600 dark:text-teal-400" />
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {roi > 0 ? roi.toFixed(0) : '-'}%
            </p>
          </div>
        </div>
        
        {/* Cash Flow Chart */}
        {totalInvestment > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Fluxo de Caixa Acumulado</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    dataKey="ano" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Anos', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="Fluxo Acumulado"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Fluxo Descontado"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span className="text-muted-foreground">Fluxo Acumulado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 border-t-2 border-dashed border-purple-500" />
                <span className="text-muted-foreground">Fluxo Descontado (VPL)</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="rounded-xl bg-secondary p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Resumo do Investimento</p>
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Economia Anual: </span>
              <span className="font-medium text-foreground">R$ {annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Economia Total: </span>
              <span className="font-medium text-foreground">R$ {totalSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Investimento: </span>
              <span className="font-medium text-foreground">R$ {totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Viabilidade: </span>
              <span className={`font-bold ${npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {npv >= 0 ? 'Viavel' : 'Inviavel'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
