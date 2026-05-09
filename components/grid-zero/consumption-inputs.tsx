"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ConsumptionProfile } from "@/lib/grid-zero-types"
import { Upload, Zap } from "lucide-react"
import { useRef } from "react"
import Papa from "papaparse"

interface ConsumptionInputsProps {
  consumption: ConsumptionProfile
  onChange: (consumption: ConsumptionProfile) => void
}

export function ConsumptionInputs({ consumption, onChange }: ConsumptionInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTypeChange = (type: 'comercial' | 'industrial' | 'personalizado') => {
    onChange({ ...consumption, type })
  }

  const handleDailyChange = (value: number) => {
    onChange({
      ...consumption,
      dailyConsumption: value,
      monthlyConsumption: value * 30,
      annualConsumption: value * 365
    })
  }

  const handleMonthlyChange = (value: number) => {
    onChange({
      ...consumption,
      dailyConsumption: value / 30,
      monthlyConsumption: value,
      annualConsumption: value * 12
    })
  }

  const handleAnnualChange = (value: number) => {
    onChange({
      ...consumption,
      dailyConsumption: value / 365,
      monthlyConsumption: value / 12,
      annualConsumption: value
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const hourlyProfile: number[] = Array(24).fill(0)
        results.data.forEach((row: Record<string, string>) => {
          const hour = parseInt(row.hora || row.hour || '0')
          const load = parseFloat(row.carga || row.load || row.consumo || '0')
          if (hour >= 0 && hour < 24 && !isNaN(load)) {
            hourlyProfile[hour] = load
          }
        })
        
        const daily = hourlyProfile.reduce((a, b) => a + b, 0)
        onChange({
          ...consumption,
          type: 'personalizado',
          hourlyProfile,
          dailyConsumption: daily,
          monthlyConsumption: daily * 30,
          annualConsumption: daily * 365
        })
      }
    })
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Dados de Consumo
        </CardTitle>
        <CardDescription>
          Configure o perfil de consumo energético da instalação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Perfil de Carga</Label>
          <Select value={consumption.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comercial">Comercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="daily">Consumo Diário (kWh)</Label>
            <Input
              id="daily"
              type="number"
              min={0}
              step={0.1}
              value={consumption.dailyConsumption || ''}
              onChange={(e) => handleDailyChange(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Consumo Mensal (kWh)</Label>
            <Input
              id="monthly"
              type="number"
              min={0}
              step={1}
              value={Math.round(consumption.monthlyConsumption) || ''}
              onChange={(e) => handleMonthlyChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annual">Consumo Anual (kWh)</Label>
            <Input
              id="annual"
              type="number"
              min={0}
              step={10}
              value={Math.round(consumption.annualConsumption) || ''}
              onChange={(e) => handleAnnualChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload de Curva Horária (CSV)</Label>
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
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Curva de Carga
          </Button>
          <p className="text-xs text-muted-foreground">
            CSV com colunas: hora, carga (kW)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
