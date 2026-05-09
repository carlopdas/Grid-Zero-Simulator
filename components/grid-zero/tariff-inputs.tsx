"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TariffConfig } from "@/lib/grid-zero-types"
import { DollarSign, Clock } from "lucide-react"

interface TariffInputsProps {
  tariff: TariffConfig
  onChange: (tariff: TariffConfig) => void
}

export function TariffInputs({ tariff, onChange }: TariffInputsProps) {
  const handleToggle = (enabled: boolean) => {
    onChange({ ...tariff, enabled })
  }

  return (
    <Card className="glass-card border-0 animate-fade-in-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            Tarifas
          </CardTitle>
          <Switch
            checked={tariff.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription className="text-slate-400">
          Configure as tarifas para análise econômica (opcional)
        </CardDescription>
      </CardHeader>
      
      {tariff.enabled && (
        <CardContent className="space-y-6">
          {/* Basic Energy Rate */}
          <div className="space-y-2">
            <Label htmlFor="energyRate">Tarifa de Energia (R$/kWh)</Label>
            <Input
              id="energyRate"
              type="number"
              min={0}
              step={0.01}
              value={tariff.energyRate || ''}
              onChange={(e) => onChange({ ...tariff, energyRate: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 0.85"
              className="text-lg font-medium"
            />
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
                placeholder="0.00"
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
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Peak/Off-Peak */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4" />
              Tarifas Horárias
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
                  placeholder="Ex: 1.20"
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
                  placeholder="Ex: 0.65"
                />
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peakStart">Início Horário Ponta</Label>
              <Input
                id="peakStart"
                type="number"
                min={0}
                max={23}
                step={1}
                value={tariff.peakHours.start || ''}
                onChange={(e) => onChange({ 
                  ...tariff, 
                  peakHours: { ...tariff.peakHours, start: parseInt(e.target.value) || 0 }
                })}
                placeholder="17"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peakEnd">Fim Horário Ponta</Label>
              <Input
                id="peakEnd"
                type="number"
                min={0}
                max={24}
                step={1}
                value={tariff.peakHours.end || ''}
                onChange={(e) => onChange({ 
                  ...tariff, 
                  peakHours: { ...tariff.peakHours, end: parseInt(e.target.value) || 0 }
                })}
                placeholder="21"
              />
            </div>
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
              placeholder="Ex: 100"
            />
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
            <p className="mb-2 text-sm font-medium text-slate-300">Resumo Tarifário</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-400">Ponta: </span>
                <span className="font-medium text-white">{tariff.peakHours.start}h - {tariff.peakHours.end}h</span>
              </div>
              <div>
                <span className="text-slate-400">Diferença: </span>
                <span className="gradient-value font-medium">
                  R$ {((tariff.peakRate || 0) - (tariff.offPeakRate || 0)).toFixed(2)}/kWh
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
