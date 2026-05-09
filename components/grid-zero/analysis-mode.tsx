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
    <Card className="glass-card border-0 animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20">
            <Settings2 className="h-4 w-4 text-blue-400" />
          </div>
          Modo de Análise
        </CardTitle>
        <CardDescription className="text-slate-400">
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
                  "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all backdrop-blur-sm",
                  isSelected 
                    ? "border-[#3b82f6]/50 bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10" 
                    : "border-white/10 bg-white/5 hover:border-[#3b82f6]/30 hover:bg-white/10"
                )}
              >
                <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isSelected ? "bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20" : "bg-white/5"
                )}>
                  <Icon className={cn("h-6 w-6", isSelected ? m.color : "text-slate-500")} />
                </div>
                <div>
                  <p className="font-medium text-white">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.description}</p>
                </div>
              </Label>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
