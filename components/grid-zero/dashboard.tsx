"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ParticleBackground } from "@/components/ui/particle-background"
import { FadeIn } from "@/components/ui/motion-wrapper"
import { ConsumptionInputs } from "./consumption-inputs"
import { GenerationInputs } from "./generation-inputs"
import { BatteryInputs } from "./battery-inputs"
import { GeneratorInputs } from "./generator-inputs"
import { TariffInputs } from "./tariff-inputs"
import { AnalysisModeSelector } from "./analysis-mode"
import { EnergyChart } from "./energy-chart"
import { BatteryChart } from "./battery-chart"
import { KPICards } from "./kpi-cards"
import { ComparisonChart } from "./comparison-chart"
import { InsightsPanel } from "./insights-panel"
import { SimulationTab } from "./simulation-tab"
import { EconomicAnalysis } from "./economic-analysis"
import { ReportGenerator } from "./report-generator"
import { ThemeToggle } from "./theme-toggle"
import { 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  GeneratorConfig,
  TariffConfig,
  SimulationResults,
  AnalysisMode,
  IrradianceData
} from "@/lib/grid-zero-types"
import { runGridZeroSimulation, generateSyntheticProfile, generateSolarFromIrradiance } from "@/lib/simulation-engine"
import { 
  Zap, 
  Battery, 
  Sun, 
  DollarSign, 
  PlayCircle, 
  BarChart3, 
  FileText, 
  RefreshCw,
  BatteryCharging
} from "lucide-react"

const defaultIrradiance: IrradianceData = {
  mode: 'annual',
  annualAverage: 5.0,
  monthlyValues: Array(12).fill(5.0)
}

const defaultConsumption: ConsumptionProfile = {
  mode: 'daily',
  type: 'comercial',
  dailyConsumption: 100,
  weeklyConsumption: 700,
  monthlyConsumption: 3000,
  annualConsumption: 36500,
  hourlyProfile: generateSyntheticProfile('comercial', 100)
}

const defaultGeneration: GenerationData = {
  mode: 'synthetic',
  hourlyGeneration: generateSolarFromIrradiance(15, 80, 5.0),
  installedPower: 15,
  performanceRatio: 80,
  irradiance: defaultIrradiance,
  annualGeneration: 0,
  monthlyAverage: 0
}

const defaultBattery: BatteryConfig = {
  enabled: false,
  capacity: 50,
  chargePower: 10,
  dischargePower: 10,
  efficiency: 95,
  initialSoc: 50,
  minSoc: 20,
  maxSoc: 100,
  dod: 80,
  quantity: 1
}

const defaultGenerator: GeneratorConfig = {
  enabled: false,
  nominalPower: 20
}

const defaultTariff: TariffConfig = {
  enabled: false,
  energyRate: 0.85,
  te: 0,
  tusd: 0,
  peakRate: 1.20,
  offPeakRate: 0.65,
  contractedDemand: 0,
  peakHours: { start: 17, end: 21 }
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
  effectivelyUsed: 0,
  gridImport: 0,
  gridExport: 0,
  economic: {
    dailyGeneration: 0,
    monthlySavings: 0,
    annualSavings: 0,
    paybackYears: 0,
    roi: 0,
    lcoe: 0,
    gridEnergySaved: 0,
    peakShavingSavings: 0
  },
  sizing: {
    requiredEnergy: 0,
    correctedEnergy: 0,
    batteryCount: 0,
    requiredPower: 0,
    totalCapacity: 0,
    systemVoltage: 0,
    peakCurrent: 0,
    warnings: []
  }
}

export function GridZeroDashboard() {
  const [consumption, setConsumption] = useState<ConsumptionProfile>(defaultConsumption)
  const [generation, setGeneration] = useState<GenerationData>(defaultGeneration)
  const [windowClipping, setWindowClipping] = useState(100)
  const [battery, setBattery] = useState<BatteryConfig>(defaultBattery)
  const [generator, setGenerator] = useState<GeneratorConfig>(defaultGenerator)
  const [tariff, setTariff] = useState<TariffConfig>(defaultTariff)
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('pv-bess')
  const [results, setResults] = useState<SimulationResults>(emptyResults)
  const [isSimulating, setIsSimulating] = useState(false)

  const runSimulation = useCallback(() => {
    setIsSimulating(true)
    
    setTimeout(() => {
      const simulationResults = runGridZeroSimulation({
        consumption,
        generation,
        windowClipping,
        battery,
        generator,
        tariff,
        analysisMode
      })
      setResults(simulationResults)
      setIsSimulating(false)
    }, 200)
  }, [consumption, generation, windowClipping, battery, generator, tariff, analysisMode])

  useEffect(() => {
    runSimulation()
  }, [runSimulation])

  useEffect(() => {
    if (consumption.type !== 'personalizado' && consumption.mode === 'daily') {
      const newProfile = generateSyntheticProfile(consumption.type, consumption.dailyConsumption)
      setConsumption(prev => ({ ...prev, hourlyProfile: newProfile }))
    }
  }, [consumption.type, consumption.dailyConsumption, consumption.mode])

  const handleConsumptionChange = (newConsumption: ConsumptionProfile) => {
    if (newConsumption.type !== 'personalizado' && newConsumption.mode === 'daily') {
      const newProfile = generateSyntheticProfile(newConsumption.type, newConsumption.dailyConsumption)
      setConsumption({ ...newConsumption, hourlyProfile: newProfile })
    } else {
      setConsumption(newConsumption)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-header sticky top-0 z-50"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] pulse-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BatteryCharging className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">BESS Sizing Platform</h1>
              <p className="text-xs text-muted-foreground">Dimensionamento Tecnico e Economico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className={`btn-gradient rounded-xl transition-all ${isSimulating ? 'animate-pulse' : ''}`}
                size="sm"
                onClick={runSimulation}
                disabled={isSimulating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
                Simular
              </Button>
            </motion.div>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <Tabs defaultValue="consumption" className="space-y-6">
          <FadeIn delay={0.1}>
            <ScrollArea className="w-full">
              <TabsList className="glass-card inline-flex w-max gap-1 p-1.5">
              <TabsTrigger value="consumption" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Consumo</span>
              </TabsTrigger>
              <TabsTrigger value="battery" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <Battery className="h-4 w-4" />
                <span className="hidden sm:inline">Bateria</span>
              </TabsTrigger>
              <TabsTrigger value="pv" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Fotovoltaico</span>
              </TabsTrigger>
              <TabsTrigger value="tariff" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Tarifas</span>
              </TabsTrigger>
              <TabsTrigger value="simulation" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <PlayCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Simulacao</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Resultados</span>
              </TabsTrigger>
              <TabsTrigger value="economic" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Economico</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="glass-tab gap-2 rounded-xl px-4 data-[state=active]:text-foreground">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Relatorio</span>
              </TabsTrigger>
            </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </FadeIn>

          {/* CONSUMPTION TAB */}
          <TabsContent value="consumption" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
            <AnalysisModeSelector 
              mode={analysisMode} 
              onChange={setAnalysisMode} 
            />
            <ConsumptionInputs 
                consumption={consumption} 
                onChange={handleConsumptionChange} 
              />
            </motion.div>
          </TabsContent>

          {/* BATTERY TAB */}
          <TabsContent value="battery" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <BatteryInputs 
                battery={battery} 
                onChange={setBattery} 
              />
              <GeneratorInputs 
                generator={generator} 
                onChange={setGenerator} 
              />
            </motion.div>
          </TabsContent>

          {/* PV TAB */}
          <TabsContent value="pv" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <GenerationInputs 
                generation={generation} 
                onChange={setGeneration} 
              />
            </motion.div>
          </TabsContent>

          {/* TARIFF TAB */}
          <TabsContent value="tariff" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TariffInputs 
                tariff={tariff} 
                onChange={setTariff} 
              />
            </motion.div>
          </TabsContent>

          {/* SIMULATION TAB */}
          <TabsContent value="simulation" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SimulationTab 
                data={results.hourlyData} 
                isRunning={isSimulating} 
              />
            </motion.div>
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
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
              <InsightsPanel 
                results={results} 
                batteryEnabled={battery.enabled} 
              />
            </motion.div>
          </TabsContent>

          {/* ECONOMIC TAB */}
          <TabsContent value="economic" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EconomicAnalysis 
                results={results} 
                tariff={tariff} 
              />
            </motion.div>
          </TabsContent>

          {/* REPORT TAB */}
          <TabsContent value="report" className="space-y-6" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ReportGenerator 
                results={results}
                consumption={consumption}
                generation={generation}
                battery={battery}
                tariff={tariff}
                analysisMode={analysisMode}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="border-t border-border py-4 relative z-10"
      >
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          BESS Sizing Platform - Dimensionamento tecnico e economico de sistemas de armazenamento
        </div>
      </motion.footer>
    </div>
  )
}
