"use client"

import { motion } from "framer-motion"
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
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20">
            <Settings2 className="h-4 w-4 text-blue-400" />
          </div>
          Modo de Análise
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Selecione o tipo de sistema a ser simulado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={mode}
          onValueChange={(value) => onChange(value as AnalysisMode)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {modes.map((m, index) => {
            const Icon = m.icon
            const isSelected = mode === m.value
            return (
              <motion.div
                key={m.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor={m.value}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all backdrop-blur-sm h-full",
                    isSelected 
                      ? "border-[#3b82f6]/50 bg-gradient-to-br from-[#3b82f6]/10 to-[#8b5cf6]/10 ring-2 ring-blue-500/30 shadow-lg shadow-blue-100 dark:shadow-blue-900/20" 
                      : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-white/10"
                  )}
                >
                  <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                  <motion.div 
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isSelected ? "bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20" : "bg-slate-100 dark:bg-white/5"
                    )}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={cn("h-6 w-6", isSelected ? m.color : "text-muted-foreground")} />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </Label>
              </motion.div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
