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
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
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
        <CardDescription>
          Ajuste a limitação operacional do inversor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Window Clipping</Label>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
              {windowClipping}%
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Máximo Clipping)</span>
            <span>100% (Sem Limitação)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
