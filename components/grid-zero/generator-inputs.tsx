"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GeneratorConfig } from "@/lib/grid-zero-types"
import { Fuel } from "lucide-react"

interface GeneratorInputsProps {
  generator: GeneratorConfig
  onChange: (generator: GeneratorConfig) => void
}

export function GeneratorInputs({ generator, onChange }: GeneratorInputsProps) {
  const handleToggle = (enabled: boolean) => {
    onChange({ ...generator, enabled })
  }

  return (
    <Card className="glass-card border-0 animate-fade-in-up-delay-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20">
              <Fuel className="h-4 w-4 text-red-400" />
            </div>
            Gerador de Backup
          </CardTitle>
          <Switch
            checked={generator.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription className="text-slate-400">
          Configure o gerador de emergência
        </CardDescription>
      </CardHeader>
      {generator.enabled && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nominalPower">Potência Nominal (kW)</Label>
            <Input
              id="nominalPower"
              type="number"
              min={0}
              step={0.1}
              value={generator.nominalPower || ''}
              onChange={(e) => onChange({ ...generator, nominalPower: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-slate-500">
            O gerador será acionado quando geração + bateria {"<"} carga
          </p>
        </CardContent>
      )}
    </Card>
  )
}
