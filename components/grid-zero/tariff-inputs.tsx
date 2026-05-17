"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TariffConfig, GDType, GD_COMPENSATION_TABLE } from "@/lib/grid-zero-types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DollarSign, Clock, Info, Scale } from "lucide-react"

interface TariffInputsProps {
  tariff: TariffConfig
  onChange: (tariff: TariffConfig) => void
}

// Time options for half-hour intervals
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = (i % 2) * 30
  return {
    value: hours + minutes / 60,
    label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
})

export function TariffInputs({ tariff, onChange }: TariffInputsProps) {
  const handleToggle = (enabled: boolean) => {
    onChange({ ...tariff, enabled })
  }

  const handleGDTypeChange = (gdType: GDType) => {
    const currentYear = new Date().getFullYear()
    const yearKey = Math.min(Math.max(currentYear, 2023), 2031) as keyof typeof GD_COMPENSATION_TABLE.GD1
    const compensationPercent = GD_COMPENSATION_TABLE[gdType][yearKey] || 0
    const compensationFactor = 1 - (compensationPercent / 100)
    
    onChange({ ...tariff, gdType, compensationFactor })
  }

  const handleDateChange = (dateStr: string) => {
    if (!dateStr) {
      onChange({ ...tariff, accessRequestDate: undefined })
      return
    }
    
    const date = new Date(dateStr)
    const gd1Deadline = new Date('2022-01-07')
    const gd2Deadline = new Date('2023-01-07') // 12 meses apos a lei
    
    let gdType: GDType = 'GD3'
    if (date <= gd1Deadline) {
      gdType = 'GD1'
    } else if (date <= gd2Deadline) {
      gdType = 'GD2'
    }
    
    const currentYear = new Date().getFullYear()
    const yearKey = Math.min(Math.max(currentYear, 2023), 2031) as keyof typeof GD_COMPENSATION_TABLE.GD1
    const compensationPercent = GD_COMPENSATION_TABLE[gdType][yearKey] || 0
    const compensationFactor = 1 - (compensationPercent / 100)
    
    onChange({ ...tariff, accessRequestDate: dateStr, gdType, compensationFactor })
  }

  const formatTime = (value: number) => {
    const hours = Math.floor(value)
    const minutes = Math.round((value - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <Card className="glass-card section-blue animate-fade-in-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Tarifas
          </CardTitle>
          <Switch
            checked={tariff.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription className="text-muted-foreground">
          Configure as tarifas para analise economica (opcional)
        </CardDescription>
      </CardHeader>
      
      {tariff.enabled && (
        <CardContent className="space-y-6">
          {/* Lei 14.300/2022 - GD Type */}
          <div className="space-y-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-base font-semibold text-foreground">Lei 14.300/2022 - Marco Legal GD</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold mb-1">Marco Legal da Geracao Distribuida</p>
                  <p className="text-xs">GD I: Pedido de acesso ate 07/01/2022 - 100% compensacao</p>
                  <p className="text-xs">GD II: Entre 07/01/2022 e 12 meses da lei - Transicao</p>
                  <p className="text-xs">GD III: Apos 12 meses da lei - Nova regra</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <RadioGroup
              value={tariff.gdType}
              onValueChange={(v) => handleGDTypeChange(v as GDType)}
              className="grid grid-cols-3 gap-3"
            >
              {(['GD1', 'GD2', 'GD3'] as const).map((gd) => (
                <Label
                  key={gd}
                  htmlFor={gd}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all ${
                    tariff.gdType === gd
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-border bg-card hover:border-blue-300'
                  }`}
                >
                  <RadioGroupItem value={gd} id={gd} className="sr-only" />
                  <span className="font-semibold text-foreground">{gd === 'GD1' ? 'GD I' : gd === 'GD2' ? 'GD II' : 'GD III'}</span>
                  <span className="text-xs text-muted-foreground">
                    {gd === 'GD1' ? '100% compensacao' : `${GD_COMPENSATION_TABLE[gd][2026]}% desconto`}
                  </span>
                </Label>
              ))}
            </RadioGroup>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessDate">Data do Pedido de Acesso</Label>
                <Input
                  id="accessDate"
                  type="date"
                  value={tariff.accessRequestDate || ''}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Define automaticamente GD I, II ou III</p>
              </div>
              <div className="space-y-2">
                <Label>Fator de Compensacao</Label>
                <div className="flex h-10 items-center rounded-lg bg-secondary px-3">
                  <span className="text-lg font-bold text-foreground">
                    {((tariff.compensationFactor || 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
              </div>
            </div>
          </div>

          {/* TE and TUSD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="te">TE - Tarifa de Energia (R$/kWh)</Label>
              <Input
                id="te"
                type="number"
                min={0}
                step={0.01}
                value={tariff.te || ''}
                onChange={(e) => onChange({ ...tariff, te: parseFloat(e.target.value) || 0 })}
                placeholder="0.45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tusd">TUSD (R$/kWh)</Label>
              <Input
                id="tusd"
                type="number"
                min={0}
                step={0.01}
                value={tariff.tusd || ''}
                onChange={(e) => onChange({ ...tariff, tusd: parseFloat(e.target.value) || 0 })}
                placeholder="0.40"
              />
            </div>
          </div>

          {/* Peak/Off-Peak with half-hour support */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4" />
              Tarifas Horarias
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peakRate">Tarifa Ponta (R$/kWh)</Label>
                <Input
                  id="peakRate"
                  type="number"
                  min={0}
                  step={0.01}
                  value={tariff.peakRate || ''}
                  onChange={(e) => onChange({ ...tariff, peakRate: parseFloat(e.target.value) || 0 })}
                  placeholder="1.20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offPeakRate">Tarifa Fora Ponta (R$/kWh)</Label>
                <Input
                  id="offPeakRate"
                  type="number"
                  min={0}
                  step={0.01}
                  value={tariff.offPeakRate || ''}
                  onChange={(e) => onChange({ ...tariff, offPeakRate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.65"
                />
              </div>
            </div>
          </div>

          {/* Peak Hours with half-hour support */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Horario de Ponta</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peakStart">Inicio Horario Ponta</Label>
                <select
                  id="peakStart"
                  value={tariff.peakHours.start}
                  onChange={(e) => onChange({ 
                    ...tariff, 
                    peakHours: { ...tariff.peakHours, start: parseFloat(e.target.value) }
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peakEnd">Fim Horario Ponta</Label>
                <select
                  id="peakEnd"
                  value={tariff.peakHours.end}
                  onChange={(e) => onChange({ 
                    ...tariff, 
                    peakHours: { ...tariff.peakHours, end: parseFloat(e.target.value) }
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Fora Ponta: {formatTime(tariff.peakHours.end)} ate {formatTime(tariff.peakHours.start)} (calculado automaticamente)
            </p>
          </div>

          {/* Contracted Demand */}
          <div className="space-y-2">
            <Label htmlFor="demand">Demanda Contratada (kW)</Label>
            <Input
              id="demand"
              type="number"
              min={0}
              step={1}
              value={tariff.contractedDemand || ''}
              onChange={(e) => onChange({ ...tariff, contractedDemand: parseFloat(e.target.value) || 0 })}
              placeholder="100"
            />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Resumo Tarifario</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Horario Ponta: </span>
                <span className="font-medium text-foreground">
                  {formatTime(tariff.peakHours.start)} - {formatTime(tariff.peakHours.end)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Diferenca Ponta/FP: </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  R$ {((tariff.peakRate || 0) - (tariff.offPeakRate || 0)).toFixed(2)}/kWh
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Marco Legal: </span>
                <span className="font-medium text-foreground">{tariff.gdType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Compensacao: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {((tariff.compensationFactor || 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
