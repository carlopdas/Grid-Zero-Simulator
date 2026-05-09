"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AnalysisMode } from "@/lib/grid-zero-types"
import { Settings2, Zap, Sun, Battery } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisModeProps {
  mode: AnalysisMode
  onChange: (mode: AnalysisMode) => void
}

export function AnalysisModeSelector({ mode, onChange }: AnalysisModeProps) {
  const modes = [
    {
      value: 'load-only' as AnalysisMode,
      label: 'Apenas Carga',
      description: 'Análise de perfil de consumo sem geração',
      icon: Zap,
      color: 'text-load'
    },
    {
      value: 'pv-only' as AnalysisMode,
      label: 'Somente Fotovoltaico',
      description: 'Geração solar sem armazenamento',
      icon: Sun,
      color: 'text-solar'
    },
    {
      value: 'pv-bess' as AnalysisMode,
      label: 'Fotovoltaico + BESS',
      description: 'Sistema híbrido com bateria',
      icon: Battery,
      color: 'text-battery'
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          Modo de Análise
        </CardTitle>
        <CardDescription>
          Selecione o tipo de sistema a ser simulado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={mode}
          onValueChange={(value) => onChange(value as AnalysisMode)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {modes.map((m) => {
            const Icon = m.icon
            const isSelected = mode === m.value
            return (
              <Label
                key={m.value}
                htmlFor={m.value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 text-center transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isSelected ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn("h-6 w-6", isSelected ? m.color : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </Label>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
