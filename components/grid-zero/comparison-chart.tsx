"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationResults } from "@/lib/grid-zero-types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LabelList } from "recharts"
import { GitCompare } from "lucide-react"

interface ComparisonChartProps {
  results: SimulationResults
}

export function ComparisonChart({ results }: ComparisonChartProps) {
  const data = [
    {
      name: 'Cenário Original',
      'Exportação Potencial': results.potentialExport,
      'Aproveitada': results.selfConsumption,
      fill: 'oklch(0.7 0.15 45)'
    },
    {
      name: 'Grid Zero',
      'Curtailed': results.curtailedEnergy,
      'Aproveitada': results.effectivelyUsed,
      fill: 'oklch(0.55 0.18 145)'
    }
  ]

  const comparisonData = [
    {
      category: 'Exportação Potencial',
      valor: results.potentialExport,
      color: 'oklch(0.7 0.15 45)'
    },
    {
      category: 'Efetivamente Aproveitada',
      valor: results.effectivelyUsed,
      color: 'oklch(0.55 0.18 145)'
    },
    {
      category: 'Curtailed (Grid Zero)',
      valor: results.curtailedEnergy,
      color: 'oklch(0.55 0.2 25)'
    }
  ]

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCompare className="h-5 w-5 text-primary" />
          Comparativo de Cenários
        </CardTitle>
        <CardDescription>
          Original vs Grid Zero - energia potencialmente exportada vs aproveitada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={comparisonData} 
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit=" kWh"
                className="text-muted-foreground"
              />
              <YAxis 
                type="category"
                dataKey="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={150}
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
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Energia']}
              />
              <Bar 
                dataKey="valor" 
                radius={[0, 4, 4, 0]}
                maxBarSize={40}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="valor" 
                  position="right" 
                  formatter={(value: number) => `${value.toFixed(1)} kWh`}
                  style={{ fontSize: 11, fill: 'oklch(0.6 0.005 240)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-muted/30 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Potencial Export</p>
            <p className="text-lg font-semibold text-solar">{results.potentialExport.toFixed(1)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Aproveitada</p>
            <p className="text-lg font-semibold text-primary">{results.effectivelyUsed.toFixed(1)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Curtailed</p>
            <p className="text-lg font-semibold text-destructive">{results.curtailedEnergy.toFixed(1)} kWh</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
