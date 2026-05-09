"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { Battery } from "lucide-react"

interface BatteryChartProps {
  data: HourlySimulationResult[]
  minSoc: number
}

export function BatteryChart({ data, minSoc }: BatteryChartProps) {
  const chartData = data.map((d) => ({
    hora: `${d.hour.toString().padStart(2, '0')}:00`,
    'SOC': d.soc,
    'Carga': d.batteryCharge,
    'Descarga': -d.batteryDischarge,
  }))

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Battery className="h-5 w-5 text-battery" />
          Estado de Carga da Bateria
        </CardTitle>
        <CardDescription>
          Evolução do SOC ao longo do dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.15 260)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.15 260)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="hora" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'oklch(0.16 0.01 240)',
                  border: '1px solid oklch(0.25 0.01 240)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0.005 240)'
                }}
                labelStyle={{ color: 'oklch(0.95 0.005 240)', fontWeight: 600 }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'SOC']}
              />
              <ReferenceLine 
                y={minSoc} 
                stroke="oklch(0.55 0.2 25)" 
                strokeDasharray="5 5" 
                label={{ 
                  value: `SOC Min (${minSoc}%)`, 
                  position: 'insideRight',
                  fill: 'oklch(0.55 0.2 25)',
                  fontSize: 11
                }} 
              />
              <Area
                type="monotone"
                dataKey="SOC"
                stroke="oklch(0.55 0.15 260)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSoc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
