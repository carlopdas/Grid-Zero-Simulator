export interface ConsumptionProfile {
  mode: 'daily' | 'hourly'
  type: 'comercial' | 'industrial' | 'residencial' | 'personalizado'
  dailyConsumption: number
  weeklyConsumption: number
  monthlyConsumption: number
  annualConsumption: number
  hourlyProfile: number[]
}

export interface IrradianceData {
  mode: 'annual' | 'monthly'
  annualAverage: number
  monthlyValues: number[]
}

export interface GenerationData {
  mode: 'synthetic' | 'manual'
  hourlyGeneration: number[]
  installedPower: number
  performanceRatio: number
  irradiance: IrradianceData
  annualGeneration: number
  monthlyAverage: number
}

export interface BatterySpec {
  manufacturer: string
  model: string
  chemistry: string
  nominalEnergy: number
  usableEnergy: number
  nominalVoltage: number
  voltageRange: { min: number; max: number }
  nominalChargeCurrent: number
  maxChargeCurrent: number
  nominalDischargeCurrent: number
  maxContinuousDischargeCurrent: number
  pulseDischargeCurrent: number
  maxPower: number
  efficiency: number
  dod: number
  cycles: number
  maxExpansion: number
  communication: string
  operatingTemperature: { min: number; max: number }
}

export interface BatteryConfig {
  enabled: boolean
  capacity: number
  chargePower: number
  dischargePower: number
  efficiency: number
  initialSoc: number
  minSoc: number
  maxSoc: number
  dod: number
  specs?: BatterySpec
  quantity: number
}

export interface GeneratorConfig {
  enabled: boolean
  nominalPower: number
}

export interface TariffConfig {
  enabled: boolean
  energyRate: number
  te: number
  tusd: number
  peakRate: number
  offPeakRate: number
  contractedDemand: number
  peakHours: { start: number; end: number }
}

export type AnalysisMode = 'load-only' | 'pv-only' | 'pv-bess'

export interface SimulationInputs {
  consumption: ConsumptionProfile
  generation: GenerationData
  windowClipping: number
  battery: BatteryConfig
  generator: GeneratorConfig
  tariff: TariffConfig
  analysisMode: AnalysisMode
}

export interface HourlySimulationResult {
  hour: number
  originalGeneration: number
  clippedGeneration: number
  usefulGeneration: number
  load: number
  curtailed: number
  soc: number
  batteryCharge: number
  batteryDischarge: number
  generatorOutput: number
  deficit: number
  gridExport: number
  gridImport: number
  isPeakHour: boolean
}

export interface EconomicResults {
  dailyGeneration: number
  monthlySavings: number
  annualSavings: number
  paybackYears: number
  roi: number
  lcoe: number
  gridEnergySaved: number
  peakShavingSavings: number
}

export interface SizingResults {
  requiredEnergy: number
  correctedEnergy: number
  batteryCount: number
  requiredPower: number
  totalCapacity: number
  systemVoltage: number
  peakCurrent: number
  warnings: string[]
}

export interface SimulationResults {
  hourlyData: HourlySimulationResult[]
  totalGenerated: number
  totalConsumed: number
  selfConsumption: number
  selfConsumptionPercent: number
  curtailedEnergy: number
  curtailedPercent: number
  storedEnergy: number
  dischargedEnergy: number
  generatorEnergy: number
  energyIndependence: number
  potentialExport: number
  effectivelyUsed: number
  gridImport: number
  gridExport: number
  economic: EconomicResults
  sizing: SizingResults
}

export const COMMERCIAL_PROFILE = [
  0.2, 0.15, 0.1, 0.1, 0.15, 0.3, 0.5, 0.8, 1.0, 1.0,
  1.0, 0.9, 0.85, 0.9, 1.0, 1.0, 0.95, 0.8, 0.6, 0.4,
  0.35, 0.3, 0.25, 0.22
]

export const INDUSTRIAL_PROFILE = [
  0.6, 0.6, 0.6, 0.6, 0.65, 0.75, 0.9, 1.0, 1.0, 1.0,
  1.0, 0.95, 0.9, 0.95, 1.0, 1.0, 1.0, 0.95, 0.85, 0.75,
  0.7, 0.65, 0.6, 0.6
]

export const RESIDENTIAL_PROFILE = [
  0.3, 0.2, 0.15, 0.15, 0.15, 0.2, 0.4, 0.6, 0.5, 0.4,
  0.35, 0.4, 0.5, 0.45, 0.4, 0.45, 0.55, 0.7, 0.9, 1.0,
  0.95, 0.8, 0.6, 0.4
]

export const DEFAULT_SOLAR_PROFILE = [
  0, 0, 0, 0, 0, 0.05, 0.15, 0.35, 0.55, 0.75,
  0.9, 0.95, 1.0, 0.95, 0.85, 0.7, 0.5, 0.3, 0.1, 0.02,
  0, 0, 0, 0
]

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const SOLAR_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
