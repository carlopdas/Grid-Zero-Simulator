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
}

export function EnergyChart({ data }: EnergyChartProps) {
  const chartData = data.map((d) => ({
    hora: `${d.hour.toString().padStart(2, '0')}:00`,
    'Carga': d.load,
    'Geração Solar': d.usefulGeneration,
    'Geração Original': d.originalGeneration,
    'Curtailed': d.curtailed,
    'Bateria Descarga': d.batteryDischarge,
    'Bateria Carga': -d.batteryCharge,
  }))

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
          Comparativo entre geracao, consumo e perdas operacionais
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
                formatter={(value: number, name: string) => [
                  `${Math.abs(value).toFixed(2)} kW`,
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                onClick={() => {}}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              
              {/* Load Area */}
              <Area
                type="monotone"
                dataKey="Carga"
                stroke={COLORS.load}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradLoad)"
              />
              
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
