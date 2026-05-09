"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BatteryConfig } from "@/lib/grid-zero-types"
import { Battery } from "lucide-react"

interface BatteryInputsProps {
  battery: BatteryConfig
  onChange: (battery: BatteryConfig) => void
}

export function BatteryInputs({ battery, onChange }: BatteryInputsProps) {
  const handleToggle = (enabled: boolean) => {
    onChange({ ...battery, enabled })
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Battery className="h-5 w-5 text-battery" />
            Sistema de Bateria
          </CardTitle>
          <Switch
            checked={battery.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription>
          Configure o sistema de armazenamento de energia
        </CardDescription>
      </CardHeader>
      {battery.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (kWh)</Label>
              <Input
                id="capacity"
                type="number"
                min={0}
                step={0.1}
                value={battery.capacity || ''}
                onChange={(e) => onChange({ ...battery, capacity: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="efficiency">Eficiência (%)</Label>
              <Input
                id="efficiency"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={battery.efficiency || ''}
                onChange={(e) => onChange({ ...battery, efficiency: parseFloat(e.target.value) || 0 })}
                placeholder="90"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chargePower">Potência de Carga (kW)</Label>
              <Input
                id="chargePower"
                type="number"
                min={0}
                step={0.1}
                value={battery.chargePower || ''}
                onChange={(e) => onChange({ ...battery, chargePower: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dischargePower">Potência de Descarga (kW)</Label>
              <Input
                id="dischargePower"
                type="number"
                min={0}
                step={0.1}
                value={battery.dischargePower || ''}
                onChange={(e) => onChange({ ...battery, dischargePower: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="initialSoc">SOC Inicial (%)</Label>
              <Input
                id="initialSoc"
                type="number"
                min={0}
                max={100}
                step={1}
                value={battery.initialSoc || ''}
                onChange={(e) => onChange({ ...battery, initialSoc: parseFloat(e.target.value) || 0 })}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minSoc">SOC Mínimo (%)</Label>
              <Input
                id="minSoc"
                type="number"
                min={0}
                max={100}
                step={1}
                value={battery.minSoc || ''}
                onChange={(e) => onChange({ ...battery, minSoc: parseFloat(e.target.value) || 0 })}
                placeholder="20"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
