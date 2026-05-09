"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerationData, MONTH_NAMES, SOLAR_HOURS } from "@/lib/grid-zero-types"
import { generateSolarFromIrradiance } from "@/lib/simulation-engine"
import { Sun, Upload, Edit3, Calendar, Sparkles } from "lucide-react"
import { useRef, useState } from "react"
import Papa from "papaparse"

interface GenerationInputsProps {
  generation: GenerationData
  onChange: (generation: GenerationData) => void
}

export function GenerationInputs({ generation, onChange }: GenerationInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showManualTable, setShowManualTable] = useState(false)

  const handleIrradianceModeChange = (mode: 'annual' | 'monthly') => {
    onChange({
      ...generation,
      irradiance: { ...generation.irradiance, mode }
    })
  }

  const handleAnnualIrradianceChange = (value: number) => {
    const newIrradiance = { ...generation.irradiance, annualAverage: value }
    const newHourly = generateSolarFromIrradiance(
      generation.installedPower,
      generation.performanceRatio,
      value
    )
    onChange({
      ...generation,
      irradiance: newIrradiance,
      hourlyGeneration: newHourly,
      annualGeneration: newHourly.reduce((a, b) => a + b, 0) * 365,
      monthlyAverage: newHourly.reduce((a, b) => a + b, 0) * 30
    })
  }

  const handleMonthlyIrradianceChange = (month: number, value: number) => {
    const newMonthly = [...generation.irradiance.monthlyValues]
    newMonthly[month] = value
    
    // Calculate average
    const filledMonths = newMonthly.filter(v => v > 0)
    const average = filledMonths.length > 0 
      ? filledMonths.reduce((a, b) => a + b, 0) / filledMonths.length 
      : 0
    
    const newIrradiance = { 
      ...generation.irradiance, 
      monthlyValues: newMonthly,
      annualAverage: average
    }
    
    // Regenerate hourly profile with new average
    const newHourly = generateSolarFromIrradiance(
      generation.installedPower,
      generation.performanceRatio,
      average
    )
    
    onChange({
      ...generation,
      irradiance: newIrradiance,
      hourlyGeneration: newHourly,
      annualGeneration: newHourly.reduce((a, b) => a + b, 0) * 365,
      monthlyAverage: newHourly.reduce((a, b) => a + b, 0) * 30
    })
  }

  const handleGenerationModeChange = (mode: 'synthetic' | 'manual') => {
    onChange({ ...generation, mode })
  }

  const handleManualHourChange = (hour: number, value: number) => {
    const newHourly = [...generation.hourlyGeneration]
    newHourly[hour] = value
    const daily = newHourly.reduce((a, b) => a + b, 0)
    onChange({
      ...generation,
      mode: 'manual',
      hourlyGeneration: newHourly,
      annualGeneration: daily * 365,
      monthlyAverage: daily * 30
    })
  }

  const handlePowerChange = (value: number) => {
    const newHourly = generateSolarFromIrradiance(
      value,
      generation.performanceRatio,
      generation.irradiance.annualAverage
    )
    onChange({
      ...generation,
      installedPower: value,
      hourlyGeneration: newHourly,
      annualGeneration: newHourly.reduce((a, b) => a + b, 0) * 365,
      monthlyAverage: newHourly.reduce((a, b) => a + b, 0) * 30
    })
  }

  const handlePRChange = (value: number) => {
    const newHourly = generateSolarFromIrradiance(
      generation.installedPower,
      value,
      generation.irradiance.annualAverage
    )
    onChange({
      ...generation,
      performanceRatio: value,
      hourlyGeneration: newHourly,
      annualGeneration: newHourly.reduce((a, b) => a + b, 0) * 365,
      monthlyAverage: newHourly.reduce((a, b) => a + b, 0) * 30
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const hourlyGeneration: number[] = Array(24).fill(0)
        results.data.forEach((row: Record<string, string>) => {
          const hour = parseInt(row.hora || row.hour || '0')
          const gen = parseFloat(row.geracao || row.generation || row.kW || row.kWh || '0')
          if (hour >= 0 && hour < 24 && !isNaN(gen)) {
            hourlyGeneration[hour] = gen
          }
        })
        
        const daily = hourlyGeneration.reduce((a, b) => a + b, 0)
        onChange({
          ...generation,
          mode: 'manual',
          hourlyGeneration,
          annualGeneration: daily * 365,
          monthlyAverage: daily * 30
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar/10">
            <Sun className="h-4 w-4 text-solar" />
          </div>
          Dados Fotovoltaicos
        </CardTitle>
        <CardDescription>
          Configure a potência instalada e dados de irradiância
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Power */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="installed">Potência Instalada (kWp)</Label>
            <Input
              id="installed"
              type="number"
              min={0}
              step={0.1}
              value={generation.installedPower || ''}
              onChange={(e) => handlePowerChange(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 15"
              className="text-lg font-medium"
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
              value={generation.performanceRatio || ''}
              onChange={(e) => handlePRChange(parseFloat(e.target.value) || 0)}
              placeholder="80"
              className="text-lg font-medium"
            />
          </div>
        </div>

        {/* Irradiance */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Irradiância</Label>
          <Tabs 
            value={generation.irradiance.mode} 
            onValueChange={(v) => handleIrradianceModeChange(v as 'annual' | 'monthly')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="annual" className="gap-2">
                <Sun className="h-4 w-4" />
                Média Anual
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <Calendar className="h-4 w-4" />
                Por Mês
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="annual" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="annualIrr">Irradiância Média Anual (kWh/m²/dia)</Label>
                <Input
                  id="annualIrr"
                  type="number"
                  min={0}
                  step={0.1}
                  value={generation.irradiance.annualAverage || ''}
                  onChange={(e) => handleAnnualIrradianceChange(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5.2"
                  className="text-lg font-medium"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="pt-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {MONTH_NAMES.map((month, idx) => (
                  <div key={month} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{month.substring(0, 3)}</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={generation.irradiance.monthlyValues[idx] || ''}
                      onChange={(e) => handleMonthlyIrradianceChange(idx, parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              {generation.irradiance.annualAverage > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Média calculada: <span className="font-medium">{generation.irradiance.annualAverage.toFixed(2)} kWh/m²/dia</span>
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Generation Curve */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Curva de Geração</Label>
          <Tabs 
            value={generation.mode} 
            onValueChange={(v) => handleGenerationModeChange(v as 'synthetic' | 'manual')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="synthetic" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Automática
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="synthetic" className="pt-4">
              <p className="text-sm text-muted-foreground">
                A curva de geração será calculada automaticamente com base na potência instalada, 
                performance ratio e irradiância.
              </p>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Excel/CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualTable(!showManualTable)}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  {showManualTable ? 'Ocultar' : 'Editar'}
                </Button>
              </div>
              
              {showManualTable && (
                <div className="space-y-2">
                  <Label className="text-sm">Geração por Hora Solar (kWh)</Label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
                    {SOLAR_HOURS.map((hour) => (
                      <div key={hour} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={generation.hourlyGeneration[hour] || ''}
                          onChange={(e) => handleManualHourChange(hour, parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Geração Diária</p>
            <p className="text-lg font-semibold text-solar">
              {generation.hourlyGeneration.reduce((a, b) => a + b, 0).toFixed(1)} kWh
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Geração Mensal</p>
            <p className="text-lg font-semibold text-solar">
              {generation.monthlyAverage.toFixed(0)} kWh
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
