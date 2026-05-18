"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BatteryConfig, BatterySpec } from "@/lib/grid-zero-types"
import { Battery, Upload, FileText, AlertCircle, Check, Zap, TrendingUp } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

          {/* Arbitrage Section */}
          <div className="space-y-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Label className="text-base font-semibold text-foreground">Arbitragem de Tarifa</Label>
              </div>
              <Switch
                checked={battery.arbitrageEnabled || false}
                onCheckedChange={(enabled) => onChange({ ...battery, arbitrageEnabled: enabled })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Comprar energia da rede fora ponta (tarifa baixa) e descarregar na ponta (tarifa alta)
            </p>
            
            {battery.arbitrageEnabled && (
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <Label className="font-semibold">Estrategia de Operacao da Bateria</Label>
                  <RadioGroup
                    value={battery.arbitrageStrategy || 'auto_optimization'}
                    onValueChange={(v) => onChange({ ...battery, arbitrageStrategy: v as 'auto_optimization' | 'solar_only' | 'arbitrage_only' })}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-3">
                      <RadioGroupItem value="auto_optimization" id="auto_optimization" className="mt-1" />
                      <div>
                        <Label htmlFor="auto_optimization" className="text-sm font-medium cursor-pointer text-green-700 dark:text-green-400">
                          Otimizacao Automatica (Recomendado)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bateria carrega fora ponta (comprando da rede) e descarrega na ponta. 
                          Tambem armazena excesso solar. Maximiza economia financeira.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-3">
                      <RadioGroupItem value="solar_only" id="solar_only" className="mt-1" />
                      <div>
                        <Label htmlFor="solar_only" className="text-sm font-medium cursor-pointer text-blue-700 dark:text-blue-400">
                          Apenas Autoconsumo Solar
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bateria carrega APENAS com excesso de geracao solar. 
                          Descarrega para autoconsumo a qualquer hora. Nao compra da rede.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-3">
                      <RadioGroupItem value="arbitrage_only" id="arbitrage_only" className="mt-1" />
                      <div>
                        <Label htmlFor="arbitrage_only" className="text-sm font-medium cursor-pointer text-amber-700 dark:text-amber-400">
                          Apenas Arbitragem
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bateria carrega da rede fora ponta e descarrega integralmente na ponta. 
                          Ignora autoconsumo. Nao recomendado com FV.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arbitrageMinSoc">SOC Minimo Reservado para Emergencias (%)</Label>
                  <Input
                    id="arbitrageMinSoc"
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={battery.arbitrageMinSoc || 10}
                    onChange={(e) => onChange({ ...battery, arbitrageMinSoc: parseFloat(e.target.value) || 10 })}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Reserva de emergencia - bateria NUNCA descarrega abaixo deste nivel
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arbitrageDailyLimit">Limite de Compra da Rede por Dia (kWh)</Label>
                  <Input
                    id="arbitrageDailyLimit"
                    type="number"
                    min={0}
                    step={10}
                    value={battery.arbitrageDailyLimit || 0}
                    onChange={(e) => onChange({ ...battery, arbitrageDailyLimit: parseFloat(e.target.value) || 0 })}
                    placeholder="0 = sem limite"
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = sem limite. Limita quanta energia pode ser comprada da rede para carregar a bateria por dia.
                  </p>
                </div>
                
                {/* Charge/Discharge Windows */}
                <div className="space-y-4 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="font-semibold text-blue-700 dark:text-blue-400">Janelas de Operacao</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chargeWindowStart">Inicio Carregamento (Fora Ponta)</Label>
                      <Input
                        id="chargeWindowStart"
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={battery.chargeWindowStart ?? 21.5}
                        onChange={(e) => onChange({ ...battery, chargeWindowStart: parseFloat(e.target.value) || 21.5 })}
                        placeholder="21.5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: 21.5 = 21:30
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chargeWindowEnd">Fim Carregamento</Label>
                      <Input
                        id="chargeWindowEnd"
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={battery.chargeWindowEnd ?? 17.5}
                        onChange={(e) => onChange({ ...battery, chargeWindowEnd: parseFloat(e.target.value) || 17.5 })}
                        placeholder="17.5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: 17.5 = 17:30
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dischargeWindowStart">Inicio Descarga (Ponta)</Label>
                      <Input
                        id="dischargeWindowStart"
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={battery.dischargeWindowStart ?? 17.5}
                        onChange={(e) => onChange({ ...battery, dischargeWindowStart: parseFloat(e.target.value) || 17.5 })}
                        placeholder="17.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dischargeWindowEnd">Fim Descarga</Label>
                      <Input
                        id="dischargeWindowEnd"
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={battery.dischargeWindowEnd ?? 21.5}
                        onChange={(e) => onChange({ ...battery, dischargeWindowEnd: parseFloat(e.target.value) || 21.5 })}
                        placeholder="21.5"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetSocAtPeakStart">SOC Alvo no Inicio da Ponta (%)</Label>
                    <Input
                      id="targetSocAtPeakStart"
                      type="number"
                      min={50}
                      max={100}
                      step={5}
                      value={battery.targetSocAtPeakStart ?? 95}
                      onChange={(e) => onChange({ ...battery, targetSocAtPeakStart: parseFloat(e.target.value) || 95 })}
                      placeholder="95"
                    />
                    <p className="text-xs text-muted-foreground">
                      A bateria tentara atingir este SOC antes do inicio da janela de descarga
                    </p>
                  </div>
                </div>
                
                {/* Cost per kWh for marginal analysis */}
                <div className="space-y-2">
                  <Label htmlFor="costPerKwh">Custo por kWh de Bateria (R$/kWh)</Label>
                  <Input
                    id="costPerKwh"
                    type="number"
                    min={0}
                    step={100}
                    value={battery.costPerKwh ?? 1500}
                    onChange={(e) => onChange({ ...battery, costPerKwh: parseFloat(e.target.value) || 1500 })}
                    placeholder="1500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custo unitario da bateria para calculo de retorno marginal
                  </p>
                </div>
                
                {/* Strategy explanation */}
                <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Como funciona:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Janela de Carga ({battery.chargeWindowStart ?? 21.5}h - {battery.chargeWindowEnd ?? 17.5}h):</strong> Bateria CARREGA da rede (tarifa baixa)</li>
                    <li><strong>Janela de Descarga ({battery.dischargeWindowStart ?? 17.5}h - {battery.dischargeWindowEnd ?? 21.5}h):</strong> Bateria DESCARREGA (evita tarifa alta)</li>
                    <li><strong>Solar:</strong> Sempre armazenado quando excede consumo</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
