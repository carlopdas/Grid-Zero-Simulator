"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { 
  ComposedChart, 
  Area, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  ReferenceLine,
  Legend,
  Brush
} from "recharts"
import { Battery } from "lucide-react"

interface BatteryChartProps {
  data: HourlySimulationResult[]
  minSoc: number
}

// SOC color - dark green
const SOC_COLOR = 'oklch(0.4 0.12 145)'
const CHARGE_COLOR = 'oklch(0.55 0.18 145)'
const DISCHARGE_COLOR = 'oklch(0.6 0.15 250)'

export function BatteryChart({ data, minSoc }: BatteryChartProps) {
  const chartData = data.map((d) => ({
    hora: `${d.hour.toString().padStart(2, '0')}:00`,
    'SOC': d.soc,
    'Carga': d.batteryCharge,
    'Descarga': d.batteryDischarge,
  }))

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-battery/10">
            <Battery className="h-4 w-4 text-battery" />
          </div>
          Estado de Carga da Bateria
        </CardTitle>
        <CardDescription>
          Evolução do SOC e fluxo de energia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="colorSocNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SOC_COLOR} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={SOC_COLOR} stopOpacity={0.1}/>
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
                yAxisId="soc"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
                className="fill-muted-foreground"
              />
              <YAxis 
                yAxisId="power"
                orientation="right"
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
                  if (name === 'SOC') return [`${value.toFixed(1)}%`, name]
                  return [`${value.toFixed(2)} kW`, name]
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <ReferenceLine 
                yAxisId="soc"
                y={minSoc} 
                stroke="oklch(0.6 0.2 25)" 
                strokeDasharray="5 5" 
                label={{ 
                  value: `SOC Min (${minSoc}%)`, 
                  position: 'insideRight',
                  fill: 'oklch(0.6 0.2 25)',
                  fontSize: 11
                }} 
              />
              <Area
                yAxisId="soc"
                type="monotone"
                dataKey="SOC"
                stroke={SOC_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSocNew)"
              />
              <Bar 
                yAxisId="power"
                dataKey="Carga" 
                fill={CHARGE_COLOR}
                opacity={0.8}
                barSize={6}
              />
              <Bar 
                yAxisId="power"
                dataKey="Descarga" 
                fill={DISCHARGE_COLOR}
                opacity={0.8}
                barSize={6}
              />
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
