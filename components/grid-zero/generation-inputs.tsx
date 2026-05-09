"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GenerationData } from "@/lib/grid-zero-types"
import { Sun, Upload, Edit3 } from "lucide-react"
import { useRef, useState } from "react"
import Papa from "papaparse"

interface GenerationInputsProps {
  generation: GenerationData
  onChange: (generation: GenerationData) => void
}

export function GenerationInputs({ generation, onChange }: GenerationInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showTable, setShowTable] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const hourlyGeneration: number[] = Array(24).fill(0)
        results.data.forEach((row: Record<string, string>) => {
          const hour = parseInt(row.hora || row.hour || '0')
          const gen = parseFloat(row.geracao || row.generation || row.kW || '0')
          if (hour >= 0 && hour < 24 && !isNaN(gen)) {
            hourlyGeneration[hour] = gen
          }
        })
        
        const daily = hourlyGeneration.reduce((a, b) => a + b, 0)
        onChange({
          ...generation,
          hourlyGeneration,
          annualGeneration: daily * 365,
          monthlyAverage: daily * 30
        })
      }
    })
  }

  const handleHourlyChange = (hour: number, value: number) => {
    const newHourly = [...generation.hourlyGeneration]
    newHourly[hour] = value
    const daily = newHourly.reduce((a, b) => a + b, 0)
    onChange({
      ...generation,
      hourlyGeneration: newHourly,
      annualGeneration: daily * 365,
      monthlyAverage: daily * 30
    })
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sun className="h-5 w-5 text-solar" />
          Dados de Geração FV
        </CardTitle>
        <CardDescription>
          Importe dados de geração do PVsyst ou insira manualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="installed">Potência Instalada (kWp)</Label>
            <Input
              id="installed"
              type="number"
              min={0}
              step={0.1}
              value={generation.installedPower || ''}
              onChange={(e) => onChange({ ...generation, installedPower: parseFloat(e.target.value) || 0 })}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr">Performance Ratio (%)</Label>
            <Input
              id="pr"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={generation.pr || ''}
              onChange={(e) => onChange({ ...generation, pr: parseFloat(e.target.value) || 0 })}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualGen">Geração Anual (kWh)</Label>
            <Input
              id="annualGen"
              type="number"
              min={0}
              value={Math.round(generation.annualGeneration || 0) || ''}
              onChange={(e) => onChange({ ...generation, annualGeneration: parseFloat(e.target.value) || 0 })}
              placeholder="Informativo"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyAvg">Geração Mensal Média (kWh)</Label>
            <Input
              id="monthlyAvg"
              type="number"
              min={0}
              value={Math.round(generation.monthlyAverage || 0) || ''}
              onChange={(e) => onChange({ ...generation, monthlyAverage: parseFloat(e.target.value) || 0 })}
              placeholder="Informativo"
              disabled
            />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV (PVsyst)
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTable(!showTable)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {showTable ? 'Ocultar' : 'Editar'} Tabela
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          CSV com colunas: hora, geracao (kW)
        </p>

        {showTable && (
          <div className="max-h-64 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Hora</TableHead>
                  <TableHead>Geração (kW)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generation.hourlyGeneration.map((value, hour) => (
                  <TableRow key={hour}>
                    <TableCell className="font-medium">{hour.toString().padStart(2, '0')}:00</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={value || ''}
                        onChange={(e) => handleHourlyChange(hour, parseFloat(e.target.value) || 0)}
                        className="h-8 w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
