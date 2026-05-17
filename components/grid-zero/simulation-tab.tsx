"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HourlySimulationResult } from "@/lib/grid-zero-types"
import { Play, Clock, Zap, Battery, Sun, AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SimulationTabProps {
  data: HourlySimulationResult[]
  isRunning: boolean
}

export function SimulationTab({ data, isRunning }: SimulationTabProps) {
  // Calculate daily totals
  const totals = data.reduce((acc, row) => ({
    generation: acc.generation + row.originalGeneration,
    usefulGen: acc.usefulGen + row.usefulGeneration,
    load: acc.load + row.load,
    curtailed: acc.curtailed + row.curtailed,
    batteryCharge: acc.batteryCharge + row.batteryCharge,
    batteryDischarge: acc.batteryDischarge + row.batteryDischarge,
    gridImport: acc.gridImport + row.gridImport,
    deficit: acc.deficit + row.deficit,
  }), {
    generation: 0,
    usefulGen: 0,
    load: 0,
    curtailed: 0,
    batteryCharge: 0,
    batteryDischarge: 0,
    gridImport: 0,
    deficit: 0,
  })

  return (
    <Card className="glass-card section-blue animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Simulacao Temporal
          {isRunning && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Processando...
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Resultados horarios da simulacao - valores em kWh (energia por hora)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary/90 backdrop-blur z-10">
              <TableRow>
                <TableHead className="w-20">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hora
                  </div>
                </TableHead>
                <TableHead className="text-center w-16">Tarifa</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Sun className="h-3 w-3 text-amber-500" />
                    Geracao
                  </div>
                </TableHead>
                <TableHead className="text-right">Carga</TableHead>
                <TableHead className="text-right">Curtailed</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Battery className="h-3 w-3 text-emerald-500" />
                    SOC
                  </div>
                </TableHead>
                <TableHead className="text-right text-blue-600 dark:text-blue-400">Bat. Carga</TableHead>
                <TableHead className="text-right text-purple-600 dark:text-purple-400">Bat. Descarga</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Zap className="h-3 w-3 text-orange-500" />
                    Import. Rede
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow 
                  key={row.hour} 
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    row.isPeakHour && "bg-red-50/50 dark:bg-red-900/10"
                  )}
                >
                  <TableCell className="font-medium">
                    {row.hour.toString().padStart(2, '0')}:00
                  </TableCell>
                  <TableCell className="text-center">
                    {row.isPeakHour ? (
                      <Badge variant="destructive" className="text-xs px-1.5">
                        Ponta
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs px-1.5">
                        F.Ponta
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-amber-600 dark:text-amber-400">
                    {row.originalGeneration.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.load.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {row.curtailed > 0.1 ? row.curtailed.toFixed(1) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.soc > 0 ? (
                      <span className={cn(
                        "font-medium",
                        row.soc > 80 ? "text-emerald-600 dark:text-emerald-400" :
                        row.soc > 30 ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      )}>
                        {row.soc.toFixed(0)}%
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    row.batteryCharge > 0.1 && "text-blue-600 dark:text-blue-400"
                  )}>
                    {row.batteryCharge > 0.1 ? `+${row.batteryCharge.toFixed(1)}` : '-'}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    row.batteryDischarge > 0.1 && "text-purple-600 dark:text-purple-400"
                  )}>
                    {row.batteryDischarge > 0.1 ? `-${row.batteryDischarge.toFixed(1)}` : '-'}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right",
                    row.gridImport > 0.1 && row.isPeakHour && "text-red-600 dark:text-red-400 font-medium",
                    row.gridImport > 0.1 && !row.isPeakHour && "text-orange-600 dark:text-orange-400"
                  )}>
                    {row.gridImport > 0.1 ? row.gridImport.toFixed(1) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-secondary/50 font-bold border-t-2">
                <TableCell colSpan={2}>TOTAL DIARIO</TableCell>
                <TableCell className="text-right text-amber-600 dark:text-amber-400">
                  {totals.generation.toFixed(0)} kWh
                </TableCell>
                <TableCell className="text-right">
                  {totals.load.toFixed(0)} kWh
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {totals.curtailed > 0.1 ? `${totals.curtailed.toFixed(0)} kWh` : '-'}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400">
                  {totals.batteryCharge > 0.1 ? `${totals.batteryCharge.toFixed(0)} kWh` : '-'}
                </TableCell>
                <TableCell className="text-right text-purple-600 dark:text-purple-400">
                  {totals.batteryDischarge > 0.1 ? `${totals.batteryDischarge.toFixed(0)} kWh` : '-'}
                </TableCell>
                <TableCell className="text-right text-orange-600 dark:text-orange-400">
                  {totals.gridImport > 0.1 ? `${totals.gridImport.toFixed(0)} kWh` : '-'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
        
        {/* Debug Info */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-secondary p-4 backdrop-blur-sm">
            <h4 className="mb-2 text-sm font-medium text-foreground">Legenda</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>Geracao Solar</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>Bateria Carregando</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>Bateria Descarregando</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>Importacao da Rede</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>Horario Ponta</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>Fora Ponta</span>
            </div>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-900/20 dark:to-blue-900/20 p-4">
            <h4 className="mb-2 text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Comportamento Esperado (Arbitragem)
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Fora Ponta (21:30-17:30):</strong> Bateria CARREGA da rede (azul)</p>
              <p><strong>Ponta (17:30-21:30):</strong> Bateria DESCARREGA (roxo)</p>
              <p className="text-amber-600 dark:text-amber-400">Se bateria descarregar fora ponta, a logica precisa revisao!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
