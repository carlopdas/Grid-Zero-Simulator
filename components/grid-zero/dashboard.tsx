"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ConsumptionInputs } from "./consumption-inputs"
import { GenerationInputs } from "./generation-inputs"
import { ControlInputs } from "./control-inputs"
import { BatteryInputs } from "./battery-inputs"
import { GeneratorInputs } from "./generator-inputs"
import { EnergyChart } from "./energy-chart"
import { BatteryChart } from "./battery-chart"
import { KPICards } from "./kpi-cards"
import { ComparisonChart } from "./comparison-chart"
import { InsightsPanel } from "./insights-panel"
import { SimulationTab } from "./simulation-tab"
import { ThemeToggle } from "./theme-toggle"
import { 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  GeneratorConfig,
  SimulationResults,
  HourlySimulationResult
} from "@/lib/grid-zero-types"
import { runGridZeroSimulation, generateSyntheticProfile, generateDefaultSolarProfile } from "@/lib/simulation-engine"
import { Settings, PlayCircle, BarChart3, Lightbulb, Zap, RefreshCw } from "lucide-react"

const defaultConsumption: ConsumptionProfile = {
  type: 'comercial',
  dailyConsumption: 100,
  monthlyConsumption: 3000,
  annualConsumption: 36500,
  hourlyProfile: generateSyntheticProfile('comercial', 100)
}

const defaultGeneration: GenerationData = {
  hourlyGeneration: generateDefaultSolarProfile(15),
  installedPower: 15,
  pr: 80,
  annualGeneration: 0,
  monthlyAverage: 0
}

const defaultBattery: BatteryConfig = {
  enabled: false,
  capacity: 50,
  chargePower: 10,
  dischargePower: 10,
  efficiency: 90,
  initialSoc: 50,
  minSoc: 20
}

const defaultGenerator: GeneratorConfig = {
  enabled: false,
  nominalPower: 20
}

const emptyResults: SimulationResults = {
  hourlyData: [],
  totalGenerated: 0,
  totalConsumed: 0,
  selfConsumption: 0,
  selfConsumptionPercent: 0,
  curtailedEnergy: 0,
  curtailedPercent: 0,
  storedEnergy: 0,
  dischargedEnergy: 0,
  generatorEnergy: 0,
  energyIndependence: 0,
  potentialExport: 0,
  effectivelyUsed: 0
}

export function GridZeroDashboard() {
  const [consumption, setConsumption] = useState<ConsumptionProfile>(defaultConsumption)
  const [generation, setGeneration] = useState<GenerationData>(defaultGeneration)
  const [windowClipping, setWindowClipping] = useState(100)
  const [battery, setBattery] = useState<BatteryConfig>(defaultBattery)
  const [generator, setGenerator] = useState<GeneratorConfig>(defaultGenerator)
  const [results, setResults] = useState<SimulationResults>(emptyResults)
  const [isSimulating, setIsSimulating] = useState(false)

  const runSimulation = useCallback(() => {
    setIsSimulating(true)
    
    // Small delay to show animation
    setTimeout(() => {
      const simulationResults = runGridZeroSimulation({
        consumption,
        generation,
        windowClipping,
        battery,
        generator
      })
      setResults(simulationResults)
      setIsSimulating(false)
    }, 300)
  }, [consumption, generation, windowClipping, battery, generator])

  // Auto-run simulation when inputs change
  useEffect(() => {
    runSimulation()
  }, [runSimulation])

  // Update consumption profile when type changes
  useEffect(() => {
    if (consumption.type !== 'personalizado') {
      const newProfile = generateSyntheticProfile(consumption.type, consumption.dailyConsumption)
      setConsumption(prev => ({ ...prev, hourlyProfile: newProfile }))
    }
  }, [consumption.type, consumption.dailyConsumption])

  const handleConsumptionChange = (newConsumption: ConsumptionProfile) => {
    if (newConsumption.type !== 'personalizado' && newConsumption.type !== consumption.type) {
      const newProfile = generateSyntheticProfile(newConsumption.type, newConsumption.dailyConsumption)
      setConsumption({ ...newConsumption, hourlyProfile: newProfile })
    } else if (newConsumption.type !== 'personalizado' && newConsumption.dailyConsumption !== consumption.dailyConsumption) {
      const newProfile = generateSyntheticProfile(newConsumption.type, newConsumption.dailyConsumption)
      setConsumption({ ...newConsumption, hourlyProfile: newProfile })
    } else {
      setConsumption(newConsumption)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Grid Zero Simulator</h1>
              <p className="text-xs text-muted-foreground">Simulação Operacional FV</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runSimulation}
              disabled={isSimulating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="inputs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="inputs" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Inputs</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Simulação</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* INPUTS TAB */}
          <TabsContent value="inputs" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ConsumptionInputs 
                consumption={consumption} 
                onChange={handleConsumptionChange} 
              />
              <GenerationInputs 
                generation={generation} 
                onChange={setGeneration} 
              />
            </div>
            <ControlInputs 
              windowClipping={windowClipping} 
              onChange={setWindowClipping} 
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <BatteryInputs 
                battery={battery} 
                onChange={setBattery} 
              />
              <GeneratorInputs 
                generator={generator} 
                onChange={setGenerator} 
              />
            </div>
          </TabsContent>

          {/* SIMULATION TAB */}
          <TabsContent value="simulation" className="space-y-6">
            <SimulationTab 
              data={results.hourlyData} 
              isRunning={isSimulating} 
            />
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results" className="space-y-6">
            <KPICards 
              results={results} 
              batteryEnabled={battery.enabled}
              generatorEnabled={generator.enabled}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <EnergyChart data={results.hourlyData} />
              {battery.enabled && (
                <BatteryChart 
                  data={results.hourlyData} 
                  minSoc={battery.minSoc} 
                />
              )}
            </div>
            <ComparisonChart results={results} />
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-6">
            <InsightsPanel 
              results={results} 
              batteryEnabled={battery.enabled} 
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Grid Zero Simulator • Simulação operacional de sistemas fotovoltaicos • 
          Dados de geração importados externamente (PVsyst)
        </div>
      </footer>
    </div>
  )
}
