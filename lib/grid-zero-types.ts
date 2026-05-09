export interface ConsumptionProfile {
  type: 'comercial' | 'industrial' | 'personalizado'
  dailyConsumption: number
  monthlyConsumption: number
  annualConsumption: number
  hourlyProfile: number[]
}

export interface GenerationData {
  hourlyGeneration: number[]
  installedPower?: number
  pr?: number
  annualGeneration?: number
  monthlyAverage?: number
}

export interface BatteryConfig {
  enabled: boolean
  capacity: number
  chargePower: number
  dischargePower: number
  efficiency: number
  initialSoc: number
  minSoc: number
}

export interface GeneratorConfig {
  enabled: boolean
  nominalPower: number
}

export interface SimulationInputs {
  consumption: ConsumptionProfile
  generation: GenerationData
  windowClipping: number
  battery: BatteryConfig
  generator: GeneratorConfig
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

export const DEFAULT_SOLAR_PROFILE = [
  0, 0, 0, 0, 0, 0.05, 0.15, 0.35, 0.55, 0.75,
  0.9, 0.95, 1.0, 0.95, 0.85, 0.7, 0.5, 0.3, 0.1, 0.02,
  0, 0, 0, 0
]
