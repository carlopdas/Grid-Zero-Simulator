"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { 
  ComposedChart, 
  Area, 
  Line,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Brush,
  ReferenceLine
} from "recharts"
import { BarChart3 } from "lucide-react"

interface EnergyChartProps {
  data: HourlySimulationResult[]
}

// Chart colors using CSS variables
const COLORS = {
  load: 'oklch(0.5 0.15 250)',
  solar: 'oklch(0.7 0.18 85)',
  storage: 'oklch(0.55 0.18 145)',
  clipping: 'oklch(0.6 0.2 25)',
  soc: 'oklch(0.4 0.12 145)',
  batteryChargeGrid: 'oklch(0.6 0.2 35)', // Orange for grid charging
  batteryChargeSolar: 'oklch(0.6 0.15 145)', // Green for solar charging
}

export function EnergyChart({ data }: EnergyChartProps) {
  // Calculate grid charging for battery (energy bought from grid to charge battery)
  const chartData = data.map((d) => {
    // batteryChargeGrid is the energy from grid used to charge battery
    // This is the "additional consumption" that appears as cost
    const gridChargingPower = d.batteryChargeGrid || 0
    
    return {
      hora: `${d.hour.toString().padStart(2, '0')}:00`,
      'Carga Cliente': d.load,
      'Carga Bateria (Rede)': gridChargingPower,
      'Consumo Total': d.load + gridChargingPower, // For tooltip reference
      'Geração Solar': d.usefulGeneration,
      'Geração Original': d.originalGeneration,
      'Curtailed': d.curtailed,
      'Bateria Descarga': d.batteryDischarge,
      'Bateria Carga Solar': d.batteryChargeSolar || 0,
      isPeakHour: d.isPeakHour,
    }
  })
  
  // Check if there's any grid charging in the data
  const hasGridCharging = chartData.some(d => d['Carga Bateria (Rede)'] > 0.1)

  return (
    <Card className="glass-card section-blue animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Perfil Energetico Diario
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Comparativo entre geracao, consumo e operacao da bateria
          {hasGridCharging && (
            <span className="ml-2 text-orange-500 dark:text-orange-400 font-medium">
              (Inclui carga da bateria via rede)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="gradLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.load} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.load} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradBatteryChargeGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.batteryChargeGrid} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={COLORS.batteryChargeGrid} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.solar} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.solar} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradStorage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.storage} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.storage} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="hora" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit=" kW"
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
                formatter={(value: number, name: string) => {
                  if (name === 'Consumo Total') return null // Hide from tooltip, it's calculated
                  return [
                    `${Math.abs(value).toFixed(2)} kW`,
                    name
                  ]
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0]?.payload
                    const total = (data?.['Carga Cliente'] || 0) + (data?.['Carga Bateria (Rede)'] || 0)
                    const isPeak = data?.isPeakHour
                    return (
                      <span>
                        {label} {isPeak ? '(Ponta)' : '(Fora Ponta)'}
                        {total > 0 && <span className="block text-xs text-muted-foreground">Demanda Total: {total.toFixed(2)} kW</span>}
                      </span>
                    )
                  }
                  return label
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                onClick={() => {}}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              
              {/* Stacked Area: Client Load (base) + Battery Charging from Grid */}
              <Area
                type="monotone"
                dataKey="Carga Cliente"
                stackId="consumption"
                stroke={COLORS.load}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradLoad)"
                name="Carga Cliente"
              />
              
              {/* Battery Charging from Grid - stacked on top of client load */}
              {hasGridCharging && (
                <Area
                  type="monotone"
                  dataKey="Carga Bateria (Rede)"
                  stackId="consumption"
                  stroke={COLORS.batteryChargeGrid}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradBatteryChargeGrid)"
                  name="Carga Bateria (Rede)"
                />
              )}
              
              {/* Solar Generation */}
              <Area
                type="monotone"
                dataKey="Geração Solar"
                stroke={COLORS.solar}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradSolar)"
              />
              
              {/* Original Generation (dashed line) */}
              <Line
                type="monotone"
                dataKey="Geração Original"
                stroke={COLORS.solar}
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                opacity={0.5}
              />
              
              {/* Curtailed Energy */}
              <Bar
                dataKey="Curtailed"
                fill={COLORS.clipping}
                opacity={0.7}
                barSize={8}
              />
              
              {/* Battery Discharge */}
              <Area
                type="monotone"
                dataKey="Bateria Descarga"
                stroke={COLORS.storage}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradStorage)"
              />
              
              {/* Zoom/Brush */}
              <Brush 
                dataKey="hora" 
                height={20} 
                stroke="var(--primary)"
                fill="var(--muted)"
                travellerWidth={8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
