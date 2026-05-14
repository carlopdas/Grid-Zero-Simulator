"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsumptionProfile } from "@/lib/grid-zero-types"
import { Upload, Zap, Calculator, Calendar } from "lucide-react"
import { MONTH_NAMES } from "@/lib/grid-zero-types"
import { useRef } from "react"
import Papa from "papaparse"

interface ConsumptionInputsProps {
  consumption: ConsumptionProfile
  onChange: (consumption: ConsumptionProfile) => void
}

export function ConsumptionInputs({ consumption, onChange }: ConsumptionInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = (mode: 'daily' | 'hourly' | 'monthly' | 'monthly-detailed') => {
    if (mode === 'daily') {
      // When switching to daily mode, distribute evenly
      const newHourly = Array(24).fill(consumption.dailyConsumption / 24)
      onChange({ ...consumption, mode, hourlyProfile: newHourly })
    } else if (mode === 'monthly') {
      // Single monthly value
      onChange({ ...consumption, mode })
    } else if (mode === 'monthly-detailed') {
      // 12 monthly values
      const monthlyProfile = consumption.monthlyProfile || Array(12).fill(consumption.monthlyConsumption || 3000)
      onChange({ ...consumption, mode, monthlyProfile })
    } else {
      onChange({ ...consumption, mode })
    }
  }

  const handleMonthlyChange = (value: number) => {
    const daily = value / 30
    const monthlyProfile = Array(12).fill(value)
    onChange({
      ...consumption,
      monthlyConsumption: value,
      dailyConsumption: daily,
      weeklyConsumption: daily * 7,
      annualConsumption: value * 12,
      hourlyProfile: Array(24).fill(daily / 24),
      monthlyProfile
    })
  }

  const handleMonthChange = (month: number, value: number) => {
    const newMonthly = [...(consumption.monthlyProfile || Array(12).fill(3000))]
    newMonthly[month] = value
    
    const annual = newMonthly.reduce((sum, val) => sum + val, 0)
    const avgMonthly = annual / 12
    const daily = avgMonthly / 30
    
    onChange({
      ...consumption,
      mode: 'monthly-detailed',
      monthlyProfile: newMonthly,
      monthlyConsumption: avgMonthly,
      dailyConsumption: daily,
      weeklyConsumption: daily * 7,
      annualConsumption: annual,
      hourlyProfile: Array(24).fill(daily / 24)
    })
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
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Dados de Consumo
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Configure o perfil de consumo energetico da instalacao
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={consumption.mode} onValueChange={(v) => handleModeChange(v as 'daily' | 'hourly' | 'monthly' | 'monthly-detailed')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily" className="gap-1 text-xs sm:text-sm">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Diario</span>
            </TabsTrigger>
            <TabsTrigger value="hourly" className="gap-1 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Horario</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-1 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mensal</span>
            </TabsTrigger>
            <TabsTrigger value="monthly-detailed" className="gap-1 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">12 Meses</span>
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
          
          <TabsContent value="monthly" className="space-y-4 pt-4">
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
              <Label htmlFor="monthlyTotal">Consumo Mensal Total (kWh/mes)</Label>
              <Input
                id="monthlyTotal"
                type="number"
                min={0}
                step={1}
                value={consumption.monthlyConsumption || ''}
                onChange={(e) => handleMonthlyChange(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 3000"
                className="text-lg font-medium"
              />
              <p className="text-xs text-muted-foreground">
                O consumo diario sera calculado automaticamente (mensal / 30)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly-detailed" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Consumo por Mes (kWh)</Label>
              <p className="text-xs text-muted-foreground">
                Insira o consumo de cada mes para uma analise mais precisa
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {MONTH_NAMES.map((month, index) => (
                <div key={month} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {month}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={(consumption.monthlyProfile?.[index]) || ''}
                    onChange={(e) => handleMonthChange(index, parseFloat(e.target.value) || 0)}
                    className="h-9 text-sm"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm">
              <p className="font-medium text-foreground">
                Consumo Anual Total: {((consumption.monthlyProfile || []).reduce((a, b) => a + b, 0)).toLocaleString()} kWh
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Diario</p>
            <p className="text-lg font-bold text-foreground">{(consumption.dailyConsumption || 0).toFixed(1)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Semanal</p>
            <p className="text-lg font-bold text-foreground">{(consumption.weeklyConsumption || 0).toFixed(0)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Mensal</p>
            <p className="text-lg font-bold text-foreground">{(consumption.monthlyConsumption || 0).toFixed(0)} kWh</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Anual</p>
            <p className="text-lg font-bold text-foreground">{((consumption.annualConsumption || 0) / 1000).toFixed(1)} MWh</p>
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
