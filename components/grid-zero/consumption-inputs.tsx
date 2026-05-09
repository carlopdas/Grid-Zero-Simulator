"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsumptionProfile } from "@/lib/grid-zero-types"
import { Upload, Zap, Calculator } from "lucide-react"
import { useRef } from "react"
import Papa from "papaparse"

interface ConsumptionInputsProps {
  consumption: ConsumptionProfile
  onChange: (consumption: ConsumptionProfile) => void
}

export function ConsumptionInputs({ consumption, onChange }: ConsumptionInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = (mode: 'daily' | 'hourly') => {
    if (mode === 'daily') {
      // When switching to daily mode, distribute evenly
      const newHourly = Array(24).fill(consumption.dailyConsumption / 24)
      onChange({ ...consumption, mode, hourlyProfile: newHourly })
    } else {
      onChange({ ...consumption, mode })
    }
  }

  const handleTypeChange = (type: 'comercial' | 'industrial' | 'residencial' | 'personalizado') => {
    onChange({ ...consumption, type })
  }

  const handleDailyChange = (value: number) => {
    const newHourly = consumption.mode === 'daily' 
      ? Array(24).fill(value / 24)
      : consumption.hourlyProfile
    
    onChange({
      ...consumption,
      dailyConsumption: value,
      weeklyConsumption: value * 7,
      monthlyConsumption: value * 30,
      annualConsumption: value * 365,
      hourlyProfile: newHourly
    })
  }

  const handleHourlyChange = (hour: number, value: number) => {
    const newHourly = [...consumption.hourlyProfile]
    newHourly[hour] = value
    
    const daily = newHourly.reduce((sum, val) => sum + val, 0)
    
    onChange({
      ...consumption,
      mode: 'hourly',
      type: 'personalizado',
      hourlyProfile: newHourly,
      dailyConsumption: daily,
      weeklyConsumption: daily * 7,
      monthlyConsumption: daily * 30,
      annualConsumption: daily * 365
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
          const load = parseFloat(row.carga || row.load || row.consumo || row.kWh || '0')
          if (hour >= 0 && hour < 24 && !isNaN(load)) {
            hourlyProfile[hour] = load
          }
        })
        
        const daily = hourlyProfile.reduce((a, b) => a + b, 0)
        onChange({
          ...consumption,
          mode: 'hourly',
          type: 'personalizado',
          hourlyProfile,
          dailyConsumption: daily,
          weeklyConsumption: daily * 7,
          monthlyConsumption: daily * 30,
          annualConsumption: daily * 365
        })
      }
    })
  }

  return (
    <Card className="glass-card section-blue animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          Dados de Consumo
        </CardTitle>
        <CardDescription className="text-sm text-gray-400">
          Configure o perfil de consumo energetico da instalacao
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={consumption.mode} onValueChange={(v) => handleModeChange(v as 'daily' | 'hourly')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="gap-2">
              <Calculator className="h-4 w-4" />
              Consumo Diário
            </TabsTrigger>
            <TabsTrigger value="hourly" className="gap-2">
              <Zap className="h-4 w-4" />
              Consumo Horário
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Perfil de Carga</Label>
              <Select value={consumption.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dailyTotal">Consumo Diário Total (kWh/dia)</Label>
              <Input
                id="dailyTotal"
                type="number"
                min={0}
                step={0.1}
                value={consumption.dailyConsumption || ''}
                onChange={(e) => handleDailyChange(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 100"
                className="text-lg font-medium"
              />
              <p className="text-xs text-muted-foreground">
                A curva será gerada automaticamente com base no perfil selecionado
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="hourly" className="space-y-4 pt-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {hour.toString().padStart(2, '0')}:00
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={consumption.hourlyProfile[hour] || ''}
                    onChange={(e) => handleHourlyChange(hour, parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 rounded-xl bg-green-50 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Diario</p>
            <p className="text-lg font-bold text-gray-900">{(consumption.dailyConsumption || 0).toFixed(1)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Semanal</p>
            <p className="text-lg font-bold text-gray-900">{(consumption.weeklyConsumption || 0).toFixed(0)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Mensal</p>
            <p className="text-lg font-bold text-gray-900">{(consumption.monthlyConsumption || 0).toFixed(0)} kWh</p>
          </div>
        </div>

        {/* Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="btn-gradient w-full rounded-xl"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Excel/CSV
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Suporta .csv e .xlsx com 24 pontos horários
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
