"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationResults, MONTH_NAMES } from "@/lib/grid-zero-types"
import { 
  ComposedChart, 
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend
} from "recharts"
import { Calendar } from "lucide-react"

interface MonthlyChartProps {
  results: SimulationResults
  monthlyConsumption?: number[]
}

// Colors for charts
const COLORS = {
  generation: '#f59e0b',
  consumption: '#3b82f6',
  import: '#64748b',
  curtailed: '#ef4444',
}

export function MonthlyChart({ results, monthlyConsumption }: MonthlyChartProps) {
  // Generate monthly data based on daily simulation
  // For now, we extrapolate daily data to monthly
  const dailyGeneration = results.totalGenerated
  const dailyConsumption = results.totalConsumed
  const dailyCurtailed = results.curtailedEnergy
  const dailyImport = results.gridImport
  
  // Create 12-month data
  const chartData = MONTH_NAMES.map((month, index) => {
    // Seasonal variation factor (higher in summer months in Brazil - Nov to Feb)
    const seasonalFactor = [0.95, 0.92, 0.95, 0.98, 1.0, 1.02, 1.05, 1.08, 1.05, 1.0, 0.98, 0.95][index]
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][index]
    
    const monthlyGen = dailyGeneration * daysInMonth * seasonalFactor
    const monthlyCons = (monthlyConsumption?.[index] || dailyConsumption * daysInMonth)
    const monthlyCurtailed = dailyCurtailed * daysInMonth * seasonalFactor
    const monthlyImportCalc = dailyImport * daysInMonth
    
    return {
      mes: month.substring(0, 3),
      'Geracao Solar': Math.round(monthlyGen),
      'Consumo': Math.round(monthlyCons),
      'Importacao Rede': Math.round(monthlyImportCalc),
      'Curtailed': Math.round(monthlyCurtailed),
    }
  })

  return (
    <Card className="glass-card section-green animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          Perfil Energetico Mensal
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Projecao mensal baseada na simulacao diaria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit=" kWh"
                className="fill-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--card-foreground)'
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number) => [`${value.toLocaleString()} kWh`]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Consumption bars */}
              <Bar
                dataKey="Consumo"
                fill={COLORS.consumption}
                opacity={0.8}
                radius={[4, 4, 0, 0]}
              />
              
              {/* Generation line */}
              <Line
                type="monotone"
                dataKey="Geracao Solar"
                stroke={COLORS.generation}
                strokeWidth={3}
                dot={{ fill: COLORS.generation, strokeWidth: 2 }}
              />
              
              {/* Import line */}
              <Line
                type="monotone"
                dataKey="Importacao Rede"
                stroke={COLORS.import}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              
              {/* Curtailed line */}
              <Line
                type="monotone"
                dataKey="Curtailed"
                stroke={COLORS.curtailed}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Annual Summary */}
        <div className="mt-4 grid grid-cols-4 gap-3 rounded-xl bg-secondary p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Geracao Anual</p>
            <p className="text-lg font-bold text-amber-500">
              {(chartData.reduce((sum, d) => sum + d['Geracao Solar'], 0) / 1000).toFixed(1)} MWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Consumo Anual</p>
            <p className="text-lg font-bold text-blue-500">
              {(chartData.reduce((sum, d) => sum + d['Consumo'], 0) / 1000).toFixed(1)} MWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Importacao Anual</p>
            <p className="text-lg font-bold text-slate-500">
              {(chartData.reduce((sum, d) => sum + d['Importacao Rede'], 0) / 1000).toFixed(1)} MWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Curtailed Anual</p>
            <p className="text-lg font-bold text-red-500">
              {(chartData.reduce((sum, d) => sum + d['Curtailed'], 0) / 1000).toFixed(1)} MWh
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
