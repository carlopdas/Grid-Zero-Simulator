"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { BarChart3 } from "lucide-react"

interface EnergyChartProps {
  data: HourlySimulationResult[]
}

export function EnergyChart({ data }: EnergyChartProps) {
  const chartData = data.map((d) => ({
    hora: `${d.hour.toString().padStart(2, '0')}:00`,
    'Geração Original': d.originalGeneration,
    'Geração Grid Zero': d.usefulGeneration,
    'Carga': d.load,
    'Curtailed': d.curtailed,
    'Bateria': d.batteryDischarge,
    'Gerador': d.generatorOutput,
  }))

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Perfil Energético Diário
        </CardTitle>
        <CardDescription>
          Comparativo entre geração, consumo e perdas operacionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.15 45)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.7 0.15 45)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGridZero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 145)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.18 145)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.5 0.15 260)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="oklch(0.5 0.15 260)" stopOpacity={0.1}/>
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
                unit=" kW"
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
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} kW`,
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="Geração Original"
                stroke="oklch(0.7 0.15 45)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorOriginal)"
              />
              <Area
                type="monotone"
                dataKey="Geração Grid Zero"
                stroke="oklch(0.55 0.18 145)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGridZero)"
              />
              <Area
                type="monotone"
                dataKey="Carga"
                stroke="oklch(0.5 0.15 260)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLoad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
