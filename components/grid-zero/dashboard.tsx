"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
import { MonthlyChart } from "./monthly-chart"
import { InsightsPanel } from "./insights-panel"
import { SimulationTab } from "./simulation-tab"
import { EconomicAnalysis } from "./economic-analysis"
import { InvestmentAnalysis } from "./investment-analysis"
import { ReportGenerator } from "./report-generator"
import { ThemeToggle } from "./theme-toggle"
import { ProjectManager } from "./project-manager"
import { Project } from "@/lib/project-storage"
import { 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  GeneratorConfig,
  TariffConfig,
  SimulationResults,
  AnalysisMode,
  IrradianceData,
  InvestmentConfig,
  DEFAULT_MONTHLY_IRRADIANCE
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
  mode: 'monthly',
  annualAverage: DEFAULT_MONTHLY_IRRADIANCE.reduce((a, b) => a + b, 0) / 12,
  monthlyValues: [...DEFAULT_MONTHLY_IRRADIANCE]
}

const defaultConsumption: ConsumptionProfile = {
  mode: 'daily',
  type: 'comercial',
  dailyConsumption: 100,
  weeklyConsumption: 700,
  monthlyConsumption: 3000,
  annualConsumption: 36500,
  hourlyProfile: generateSyntheticProfile('comercial', 100),
  monthlyProfile: Array(12).fill(3000) // Default 3000 kWh per month
}

const defaultGeneration: GenerationData = {
  mode: 'synthetic',
  seasonalityMode: 'auto',
  hourlyGeneration: generateSolarFromIrradiance(15, 80, defaultIrradiance.annualAverage),
  installedPower: 15,
  performanceRatio: 80,
  irradiance: defaultIrradiance,
  annualGeneration: 0,
  monthlyAverage: 0,
  monthlyGeneration: DEFAULT_MONTHLY_IRRADIANCE.map(irr => 
    generateSolarFromIrradiance(15, 80, irr).reduce((a, b) => a + b, 0) * 30
  )
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
  quantity: 1,
  arbitrageEnabled: false,
  arbitrageMinSoc: 10,
  arbitrageStrategy: 'auto_optimization',
  arbitrageDailyLimit: 0,
  chargeWindowStart: 21.5,
  chargeWindowEnd: 17.5,
  dischargeWindowStart: 17.5,
  dischargeWindowEnd: 21.5,
  targetSocAtPeakStart: 95,
  costPerKwh: 1500
}

const defaultGenerator: GeneratorConfig = {
  enabled: false,
  nominalPower: 20
}

const defaultTariff: TariffConfig = {
  enabled: false,
  energyRate: 0.85,
  te: 0.45,
  tusd: 0.40,
  peakRate: 2.75,
  offPeakRate: 0.53,
  contractedDemand: 0,
  demandRate: 25,
  peakHours: { start: 17.5, end: 21.5 },
  monthlyPeakConsumption: 0,
  monthlyOffPeakConsumption: 0,
  currentMonthlyBill: 0,
  gdType: 'GD1',
  compensationFactor: 1.0
}

const defaultInvestment: InvestmentConfig = {
  totalInvestment: 0,
  annualMaintenanceCost: 0,
  annualInterestRate: 8,
  systemLifespan: 25,
  tariffInflation: 3
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
    dailySolarDirectKwh: 0,
    dailyBatterySolarKwh: 0,
    dailyBatteryGridKwh: 0,
    dailyArbitrageChargeKwh: 0,
    dailyArbitrageDischargeKwh: 0,
    solarDirectPeakKwh: 0,
    solarDirectOffPeakKwh: 0,
    batterySolarPeakKwh: 0,
    batterySolarOffPeakKwh: 0,
    solarDirectSavings: 0,
    batterySolarSavings: 0,
    peakShavingSavings: 0,
    arbitrageBenefit: 0,
    arbitrageCost: 0,
    arbitrageNetSavings: 0,
    grossMonthlySavings: 0,
    monthlySavings: 0,
    annualSavings: 0,
    dailySavings: 0,
    currentMonthlyBill: 0,
    savingsCapApplied: false,
    savingsCapPercent: 0,
    originalPeakDemandKw: 0,
    reducedPeakDemandKw: 0,
    demandReductionKw: 0,
    paybackYears: 0,
    paybackDiscounted: 0,
    roi: 0,
    lcoe: 0,
    irr: 0,
    npv: 0,
    marginalSavingsPerBattery: 0,
    marginalPaybackYears: 0,
    isOptimallySized: true,
    peakDeficitKwh: 0,
    peakCoveragePercent: 0,
    gridEnergySaved: 0
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
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [consumption, setConsumption] = useState<ConsumptionProfile>(defaultConsumption)
  const [generation, setGeneration] = useState<GenerationData>(defaultGeneration)
  const [windowClipping, setWindowClipping] = useState(100)
  const [battery, setBattery] = useState<BatteryConfig>(defaultBattery)
  const [generator, setGenerator] = useState<GeneratorConfig>(defaultGenerator)
  const [tariff, setTariff] = useState<TariffConfig>(defaultTariff)
  const [investment, setInvestment] = useState<InvestmentConfig>(defaultInvestment)
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('pv-bess')
  const [results, setResults] = useState<SimulationResults>(emptyResults)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleProjectLoad = (project: Project) => {
    setProjectId(project.id)
    setProjectName(project.name)
    setConsumption(project.consumption)
    setGeneration(project.generation)
    setBattery(project.battery)
    setGenerator(project.generator)
    setTariff(project.tariff)
    setAnalysisMode(project.analysisMode)
    setWindowClipping(project.windowClipping)
  }

  const handleNewProject = () => {
    setProjectId(null)
    setProjectName('')
    setConsumption(defaultConsumption)
    setGeneration(defaultGeneration)
    setBattery(defaultBattery)
    setGenerator(defaultGenerator)
    setTariff(defaultTariff)
    setAnalysisMode('pv-bess')
    setWindowClipping(100)
    setResults(emptyResults)
  }

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
    <div className="min-h-screen bg-background">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BatteryCharging className="h-5 w-5 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Grid-Zero Sizing Platform</h1>
              <p className="text-sm text-muted-foreground font-normal">Dimensionamento Tecnico e Economico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProjectManager
              projectName={projectName}
              projectId={projectId}
              onProjectNameChange={setProjectName}
              onProjectLoad={handleProjectLoad}
              onNewProject={handleNewProject}
              consumption={consumption}
              generation={generation}
              battery={battery}
              generator={generator}
              tariff={tariff}
              analysisMode={analysisMode}
              windowClipping={windowClipping}
            />
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
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="consumption" className="space-y-6">
          <FadeIn delay={0.1}>
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max gap-1 p-1.5 bg-secondary rounded-xl">
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
              <MonthlyChart 
                results={results} 
                monthlyConsumption={consumption.monthlyProfile}
                generation={generation}
              />
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
              <InvestmentAnalysis
                economic={results.economic}
                investment={investment}
                onInvestmentChange={setInvestment}
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
        className="border-t border-border bg-card py-4"
      >
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Grid-Zero Sizing Platform - Dimensionamento tecnico e economico de sistemas de armazenamento
        </div>
      </motion.footer>
    </div>
  )
}
