"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { Play, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SimulationTabProps {
  data: HourlySimulationResult[]
  isRunning: boolean
}

export function SimulationTab({ data, isRunning }: SimulationTabProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Play className="h-5 w-5 text-primary" />
          Simulação Temporal
          {isRunning && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Processando...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Resultados horários da simulação Grid Zero
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-20">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hora
                  </div>
                </TableHead>
                <TableHead className="text-right">Geração Original</TableHead>
                <TableHead className="text-right">Geração Útil</TableHead>
                <TableHead className="text-right">Carga</TableHead>
                <TableHead className="text-right">Curtailed</TableHead>
                <TableHead className="text-right">SOC</TableHead>
                <TableHead className="text-right">Bat. Carga</TableHead>
                <TableHead className="text-right">Bat. Descarga</TableHead>
                <TableHead className="text-right">Gerador</TableHead>
                <TableHead className="text-right">Déficit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.hour} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {row.hour.toString().padStart(2, '0')}:00
                  </TableCell>
                  <TableCell className="text-right text-solar">
                    {row.originalGeneration.toFixed(2)} kW
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {row.usefulGeneration.toFixed(2)} kW
                  </TableCell>
                  <TableCell className="text-right">
                    {row.load.toFixed(2)} kW
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {row.curtailed > 0 ? `${row.curtailed.toFixed(2)} kW` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-battery">
                    {row.soc > 0 ? `${row.soc.toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {row.batteryCharge > 0 ? `${row.batteryCharge.toFixed(2)} kW` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-accent">
                    {row.batteryDischarge > 0 ? `${row.batteryDischarge.toFixed(2)} kW` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-orange-500">
                    {row.generatorOutput > 0 ? `${row.generatorOutput.toFixed(2)} kW` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {row.deficit > 0 ? `${row.deficit.toFixed(2)} kW` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <div className="mt-4 rounded-lg bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-medium">Legenda</h4>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span><span className="inline-block w-3 h-3 rounded-full bg-solar mr-1"></span>Geração Original (PVsyst)</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-primary mr-1"></span>Geração Útil (Grid Zero)</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-destructive mr-1"></span>Energia Curtailed</span>
            <span><span className="inline-block w-3 h-3 rounded-full bg-battery mr-1"></span>Estado de Carga Bateria</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
