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
    <Card className="glass-card section-green animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <Settings2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          Modo de Analise
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
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
                    "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 text-center transition-all h-full",
                    isSelected 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm" 
                      : "border-border bg-card hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/10"
                  )}
                >
                  <RadioGroupItem value={m.value} id={m.value} className="sr-only" />
                  <motion.div 
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isSelected ? "bg-green-100 dark:bg-green-900/30" : "bg-secondary"
                    )}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={cn("h-6 w-6", isSelected ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
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
