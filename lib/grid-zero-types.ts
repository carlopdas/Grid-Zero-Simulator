export interface ConsumptionProfile {
  mode: 'daily' | 'hourly' | 'monthly' | 'monthly-detailed'
  type: 'comercial' | 'industrial' | 'residencial' | 'personalizado'
  dailyConsumption: number
  weeklyConsumption: number
  monthlyConsumption: number
  annualConsumption: number
  hourlyProfile: number[]
  monthlyProfile: number[] // 12 values, one per month
}

export interface IrradianceData {
  mode: 'annual' | 'monthly'
  annualAverage: number
  monthlyValues: number[] // kWh/m²/dia for each month
}

// Default monthly irradiance values for Brazil (typical values)
export const DEFAULT_MONTHLY_IRRADIANCE = [5.8, 5.6, 5.4, 5.0, 4.6, 4.4, 4.5, 4.9, 5.2, 5.5, 5.7, 5.9]

export interface GenerationData {
  mode: 'synthetic' | 'manual'
  seasonalityMode: 'auto' | 'manual-monthly' // New: how to apply seasonality
  hourlyGeneration: number[]
  monthlyHourlyProfiles?: number[][] // 12 arrays of 24 hours for manual monthly mode
  installedPower: number
  performanceRatio: number
  irradiance: IrradianceData
  annualGeneration: number
  monthlyAverage: number
  monthlyGeneration: number[] // 12 values - one per month
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

export type BatteryStrategy = 'auto_optimization' | 'solar_only' | 'arbitrage_only'

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
  // Arbitrage settings
  arbitrageEnabled: boolean
  arbitrageMinSoc: number // Min SOC reserved for emergencies - NEVER discharge below this
  arbitrageStrategy: BatteryStrategy // New: clearer strategy selection
  arbitrageDailyLimit: number // 0 = no limit, max kWh to buy from grid per day
}

export interface GeneratorConfig {
  enabled: boolean
  nominalPower: number
}

export type GDType = 'GD1' | 'GD2' | 'GD3'

export interface TariffConfig {
  enabled: boolean
  energyRate: number
  te: number
  tusd: number
  peakRate: number
  offPeakRate: number
  contractedDemand: number
  peakHours: { start: number; end: number } // Now supports half-hour (e.g., 17.5 = 17:30)
  // Lei 14.300/2022
  gdType: GDType
  accessRequestDate?: string // ISO date string
  compensationFactor: number // Calculated based on GD type and year
}

// Lei 14.300/2022 - Percentuais de desconto sobre TUSD
export const GD_COMPENSATION_TABLE = {
  GD1: { 2023: 0, 2024: 0, 2025: 0, 2026: 0, 2027: 0, 2028: 0, 2029: 0, 2030: 0, 2031: 0 },
  GD2: { 2023: 4.1, 2024: 8.1, 2025: 12.2, 2026: 16.2, 2027: 20.3, 2028: 24.3, 2029: 27.0, 2030: 27.0, 2031: 27.0 },
  GD3: { 2023: 4.1, 2024: 8.1, 2025: 12.2, 2026: 16.2, 2027: 20.3, 2028: 24.3, 2029: 27.0, 2030: 27.0, 2031: 27.0 },
  // Special case: GD3 with remote self-consumption > 500kW or shared generation > 25% credit
  GD3_SPECIAL: { 2023: 29.3, 2024: 29.3, 2025: 29.3, 2026: 29.3, 2027: 29.3, 2028: 29.3, 2029: 29.3, 2030: 29.3, 2031: 29.3 }
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
  paybackDiscounted: number
  roi: number
  lcoe: number
  gridEnergySaved: number
  peakShavingSavings: number
  arbitrageSavings: number
  irr: number // Taxa Interna de Retorno
  npv: number // Valor Presente Liquido
}

export interface InvestmentConfig {
  totalInvestment: number
  annualMaintenanceCost: number
  annualInterestRate: number
  systemLifespan: number
  tariffInflation: number
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
