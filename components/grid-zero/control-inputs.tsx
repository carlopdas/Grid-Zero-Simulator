"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SlidersHorizontal, Info } from "lucide-react"

interface ControlInputsProps {
  windowClipping: number
  onChange: (value: number) => void
}

export function ControlInputs({ windowClipping, onChange }: ControlInputsProps) {
  return (
    <Card className="glass-card border-0 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20">
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          </div>
          Controle Operacional
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Window clipping representa limitação operacional ou restrição de 
                  despacho aplicada ao inversor. 100% = sem limitação, valores menores 
                  indicam clipping parcial.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Ajuste a limitação operacional do inversor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Window Clipping</Label>
            <span className="rounded-xl bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 px-3 py-1 text-sm font-semibold">
              <span className="gradient-value">{windowClipping}%</span>
            </span>
          </div>
          <Slider
            value={[windowClipping]}
            onValueChange={([value]) => onChange(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0% (Máximo Clipping)</span>
            <span>100% (Sem Limitação)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
