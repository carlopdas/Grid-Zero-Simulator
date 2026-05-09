"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BatteryConfig, BatterySpec } from "@/lib/grid-zero-types"
import { Battery, Upload, FileText, AlertCircle, Check } from "lucide-react"
import { useRef, useState } from "react"

interface BatteryInputsProps {
  battery: BatteryConfig
  onChange: (battery: BatteryConfig) => void
}

export function BatteryInputs({ battery, onChange }: BatteryInputsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleToggle = (enabled: boolean) => {
    onChange({ ...battery, enabled })
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setParsing(true)
    setParseError(null)
    
    // Simulate PDF parsing - in production, this would use a PDF parser library
    // For now, we'll show the manual input fields
    setTimeout(() => {
      setParsing(false)
      setParseError("Parser não encontrou dados automáticos. Preencha manualmente abaixo.")
    }, 1500)
  }

  const updateSpecs = (field: keyof BatterySpec, value: string | number) => {
    const currentSpecs = battery.specs || {
      manufacturer: '',
      model: '',
      chemistry: '',
      nominalEnergy: 0,
      usableEnergy: 0,
      nominalVoltage: 48,
      voltageRange: { min: 44, max: 56 },
      nominalChargeCurrent: 0,
      maxChargeCurrent: 0,
      nominalDischargeCurrent: 0,
      maxContinuousDischargeCurrent: 0,
      pulseDischargeCurrent: 0,
      maxPower: 0,
      efficiency: 95,
      dod: 80,
      cycles: 6000,
      maxExpansion: 16,
      communication: 'CAN/RS485',
      operatingTemperature: { min: -10, max: 55 }
    }
    
    onChange({
      ...battery,
      specs: { ...currentSpecs, [field]: value }
    })
  }

  return (
    <Card className="glass-card border-0 animate-fade-in-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
              <Battery className="h-4 w-4 text-emerald-400" />
            </div>
            Dados da Bateria
          </CardTitle>
          <Switch
            checked={battery.enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription className="text-muted-foreground">
          Upload do datasheet PDF ou preencha manualmente
        </CardDescription>
      </CardHeader>
      
      {battery.enabled && (
        <CardContent className="space-y-6">
          {/* PDF Upload */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="btn-gradient w-full rounded-xl"
              disabled={parsing}
            >
              {parsing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Analisando PDF...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Datasheet PDF
                </>
              )}
            </Button>
            
            {parseError && (
              <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{parseError}</span>
              </div>
            )}
            
            {battery.specs?.manufacturer && (
              <div className="flex items-center gap-2 rounded-lg bg-battery/10 p-3">
                <Check className="h-4 w-4 text-battery" />
                <span className="text-sm font-medium">
                  {battery.specs.manufacturer} - {battery.specs.model}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {battery.specs.chemistry}
                </Badge>
              </div>
            )}
          </div>

          {/* Manufacturer & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={battery.specs?.manufacturer || ''}
                onChange={(e) => updateSpecs('manufacturer', e.target.value)}
                placeholder="Ex: BYD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={battery.specs?.model || ''}
                onChange={(e) => updateSpecs('model', e.target.value)}
                placeholder="Ex: B-Box Premium"
              />
            </div>
          </div>

          {/* Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade/Energia (kWh)</Label>
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
              <Label htmlFor="quantity">Quantidade de Baterias</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                value={battery.quantity || 1}
                onChange={(e) => onChange({ ...battery, quantity: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>
          </div>
          
          {/* Power */}
          <div className="grid grid-cols-2 gap-4">
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
          
          {/* Efficiency & DOD */}
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="95"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dod">DOD - Profundidade de Descarga (%)</Label>
              <Input
                id="dod"
                type="number"
                min={0}
                max={100}
                step={1}
                value={battery.dod || ''}
                onChange={(e) => onChange({ ...battery, dod: parseFloat(e.target.value) || 0 })}
                placeholder="80"
              />
            </div>
          </div>
          
          {/* SOC Limits */}
          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="maxSoc">SOC Máximo (%)</Label>
              <Input
                id="maxSoc"
                type="number"
                min={0}
                max={100}
                step={1}
                value={battery.maxSoc || 100}
                onChange={(e) => onChange({ ...battery, maxSoc: parseFloat(e.target.value) || 100 })}
                placeholder="100"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl bg-secondary p-4 backdrop-blur-sm">
            <p className="mb-2 text-sm font-medium text-foreground">Capacidade Total do Sistema</p>
            <p className="gradient-value text-2xl font-bold">
              {((battery.capacity || 0) * (battery.quantity || 1)).toFixed(1)} kWh
            </p>
            <p className="text-xs text-muted-foreground">
              {battery.quantity || 1} x {battery.capacity || 0} kWh = {((battery.capacity || 0) * (battery.quantity || 1)).toFixed(1)} kWh total
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
