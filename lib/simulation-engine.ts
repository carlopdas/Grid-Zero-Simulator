import {
  SimulationInputs,
  SimulationResults,
  HourlySimulationResult,
  EconomicResults,
  SizingResults,
  COMMERCIAL_PROFILE,
  INDUSTRIAL_PROFILE,
  RESIDENTIAL_PROFILE,
  DEFAULT_SOLAR_PROFILE,
} from './grid-zero-types'

export function runGridZeroSimulation(inputs: SimulationInputs): SimulationResults {
  const { consumption, generation, windowClipping, battery, generator, tariff, analysisMode } = inputs
  
  const hourlyData: HourlySimulationResult[] = []
  let currentSoc = battery.enabled ? battery.initialSoc : 0
  
  // CRITICAL FIX: Calculate total battery capacity and power based on quantity
  const batteryQuantity = battery.quantity || 1
  const totalBatteryCapacity = battery.capacity * batteryQuantity // Total kWh
  const totalChargePower = battery.chargePower * batteryQuantity // Total kW charge
  const totalDischargePower = battery.dischargePower * batteryQuantity // Total kW discharge
  const batteryDod = battery.dod || 80
  const batteryEfficiency = battery.efficiency || 90
  
  // Usable capacity considering DOD
  const usableCapacity = totalBatteryCapacity * (batteryDod / 100)
  
  let totalGenerated = 0
  let totalConsumed = 0
  let totalCurtailed = 0
  let totalStored = 0
  let totalDischarged = 0
  let totalGeneratorUsed = 0
  let totalSelfConsumed = 0
  let potentialExport = 0
  let totalGridImport = 0
  let totalGridExport = 0
  let totalArbitrageCharge = 0
  let totalArbitrageDischarge = 0
  
  // Arbitrage tracking
  const arbitrageEnabled = battery.arbitrageEnabled || false
  const arbitrageMinSoc = battery.arbitrageMinSoc || 10
  const arbitragePriority = battery.arbitragePriority || 'self-consumption'
  const arbitrageDailyLimit = battery.arbitrageDailyLimit || 0
  let arbitrageChargedToday = 0
  
  for (let hour = 0; hour < 24; hour++) {
    let originalGen = 0
    
    if (analysisMode !== 'load-only') {
      originalGen = generation.hourlyGeneration[hour] || 0
    }
    
    const load = consumption.hourlyProfile[hour] || 0
    
    // Apply window clipping
    const clippedGen = originalGen * (windowClipping / 100)
    
    let usefulGen = 0
    let curtailed = 0
    let batteryCharge = 0
    let batteryDischarge = 0
    let generatorOutput = 0
    let deficit = 0
    let gridImport = 0
    let gridExport = 0
    
    const isPeakHour = tariff.enabled && 
      (hour + 0.5) >= tariff.peakHours.start && 
      (hour + 0.5) < tariff.peakHours.end
    
    if (analysisMode === 'load-only') {
      // Load only - no generation
      usefulGen = 0
      deficit = load
      gridImport = load
    } else if (clippedGen >= load) {
      // Case 1: Generation exceeds load
      usefulGen = load
      let excess = clippedGen - load
      potentialExport += excess
      
      // Try to store excess in battery
      if (battery.enabled && excess > 0 && analysisMode === 'pv-bess') {
        const maxSocLimit = battery.maxSoc || 100
        const minSocLimit = battery.minSoc || (100 - batteryDod)
        
        // Available capacity in kWh = total capacity * (maxSoc - currentSoc) / 100
        const availableCapacityKwh = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        
        // Max energy that can be charged this hour considering:
        // 1. Excess energy available
        // 2. Charge power limit (kW = kWh per hour)
        // 3. Available capacity in battery (accounting for efficiency losses)
        const maxChargeEnergy = Math.min(
          excess,                                    // Available excess
          totalChargePower,                          // Power limit (kW = kWh/h)
          availableCapacityKwh / (batteryEfficiency / 100)  // Capacity limit (input energy needed)
        )
        
        // Energy actually stored (after efficiency losses)
        batteryCharge = maxChargeEnergy * (batteryEfficiency / 100)
        
        // Update SOC
        currentSoc += (batteryCharge / totalBatteryCapacity) * 100
        currentSoc = Math.min(currentSoc, maxSocLimit)
        
        // Subtract charged energy from excess
        excess -= maxChargeEnergy
        totalStored += batteryCharge
      }
      
      // Remaining excess is curtailed (Grid Zero = no export)
      curtailed = excess
      totalCurtailed += curtailed
      totalSelfConsumed += load
    } else {
      // Case 2: Load exceeds generation
      usefulGen = clippedGen
      totalSelfConsumed += clippedGen
      let remaining = load - clippedGen
      
      // Try to discharge battery (prioritize during peak hours)
      if (battery.enabled && remaining > 0 && currentSoc > battery.minSoc && analysisMode === 'pv-bess') {
        // Available energy in kWh = total capacity * (currentSoc - minSoc) / 100
        const availableEnergyKwh = totalBatteryCapacity * (currentSoc - battery.minSoc) / 100
        
        // Max discharge considering:
        // 1. Remaining load to cover
        // 2. Discharge power limit
        // 3. Available energy in battery
        const maxDischargeEnergy = Math.min(
          remaining,
          totalDischargePower,
          availableEnergyKwh
        )
        
        batteryDischarge = maxDischargeEnergy
        currentSoc -= (batteryDischarge / totalBatteryCapacity) * 100
        currentSoc = Math.max(currentSoc, battery.minSoc)
        remaining -= batteryDischarge
        totalDischarged += batteryDischarge
        totalSelfConsumed += batteryDischarge
      }
      
      // Use generator if still deficit
      if (generator.enabled && remaining > 0) {
        generatorOutput = Math.min(remaining, generator.nominalPower)
        remaining -= generatorOutput
        totalGeneratorUsed += generatorOutput
      }
      
      deficit = remaining
      gridImport = remaining
      totalGridImport += gridImport
    }
    
    // Arbitrage logic: Buy energy off-peak to charge battery, discharge during peak
    if (arbitrageEnabled && battery.enabled && analysisMode === 'pv-bess') {
      const maxSocLimit = battery.maxSoc || 100
      
      if (!isPeakHour) {
        // Off-peak: Buy energy from grid to charge battery for arbitrage
        const arbitrageSOCRoom = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        const dailyLimitRemaining = arbitrageDailyLimit > 0 
          ? Math.max(0, arbitrageDailyLimit - arbitrageChargedToday)
          : Infinity
        
        const maxArbitrageCharge = Math.min(
          arbitrageSOCRoom / (batteryEfficiency / 100),
          totalChargePower - batteryCharge, // Remaining charge power
          dailyLimitRemaining
        )
        
        if (maxArbitrageCharge > 0 && currentSoc < maxSocLimit) {
          const arbitrageChargeEnergy = maxArbitrageCharge * (batteryEfficiency / 100)
          batteryCharge += arbitrageChargeEnergy
          currentSoc += (arbitrageChargeEnergy / totalBatteryCapacity) * 100
          currentSoc = Math.min(currentSoc, maxSocLimit)
          gridImport += maxArbitrageCharge
          totalGridImport += maxArbitrageCharge
          totalArbitrageCharge += maxArbitrageCharge
          arbitrageChargedToday += maxArbitrageCharge
          totalStored += arbitrageChargeEnergy
        }
      } else if (isPeakHour && arbitragePriority === 'arbitrage') {
        // Peak hour with arbitrage priority: discharge more aggressively
        const minSocForArbitrage = Math.max(battery.minSoc, arbitrageMinSoc)
        const additionalDischargeAvailable = totalBatteryCapacity * (currentSoc - minSocForArbitrage) / 100
        const additionalDischarge = Math.min(
          additionalDischargeAvailable,
          totalDischargePower - batteryDischarge
        )
        
        if (additionalDischarge > 0) {
          batteryDischarge += additionalDischarge
          currentSoc -= (additionalDischarge / totalBatteryCapacity) * 100
          currentSoc = Math.max(currentSoc, minSocForArbitrage)
          totalArbitrageDischarge += additionalDischarge
          totalDischarged += additionalDischarge
          // Reduce grid import or create export
          if (gridImport > 0) {
            const reduction = Math.min(gridImport, additionalDischarge)
            gridImport -= reduction
            totalGridImport -= reduction
          }
        }
      }
    }
    
    totalGenerated += clippedGen
    totalConsumed += load
    
    hourlyData.push({
      hour,
      originalGeneration: originalGen,
      clippedGeneration: clippedGen,
      usefulGeneration: usefulGen,
      load,
      curtailed,
      soc: battery.enabled ? currentSoc : 0,
      batteryCharge,
      batteryDischarge,
      generatorOutput,
      deficit,
      gridExport: 0,
      gridImport,
      isPeakHour
    })
  }
  
  const selfConsumptionPercent = totalGenerated > 0 
    ? (totalSelfConsumed / totalGenerated) * 100 
    : 0
    
  const curtailedPercent = totalGenerated > 0 
    ? (totalCurtailed / totalGenerated) * 100 
    : 0
    
  const energyIndependence = totalConsumed > 0 
    ? ((totalSelfConsumed + totalDischarged + totalGeneratorUsed) / totalConsumed) * 100 
    : 0

  // Economic calculations
  const economic = calculateEconomics(
    hourlyData, 
    tariff, 
    totalConsumed, 
    totalSelfConsumed + totalDischarged,
    totalArbitrageCharge,
    totalArbitrageDischarge
  )
  
  // Sizing calculations
  const sizing = calculateSizing(
    consumption,
    battery,
    totalConsumed - totalSelfConsumed - totalDischarged
  )
  
  return {
    hourlyData,
    totalGenerated,
    totalConsumed,
    selfConsumption: totalSelfConsumed,
    selfConsumptionPercent: Math.min(selfConsumptionPercent, 100),
    curtailedEnergy: totalCurtailed,
    curtailedPercent,
    storedEnergy: totalStored,
    dischargedEnergy: totalDischarged,
    generatorEnergy: totalGeneratorUsed,
    energyIndependence: Math.min(energyIndependence, 100),
    potentialExport,
    effectivelyUsed: totalSelfConsumed + totalStored,
    gridImport: totalGridImport,
    gridExport: totalGridExport,
    economic,
    sizing
  }
}

function calculateEconomics(
  hourlyData: HourlySimulationResult[],
  tariff: { enabled: boolean; energyRate: number; peakRate: number; offPeakRate: number; compensationFactor?: number; te?: number; tusd?: number },
  totalConsumed: number,
  energySaved: number,
  arbitrageCharge: number = 0,
  arbitrageDischarge: number = 0
): EconomicResults {
  if (!tariff.enabled) {
    return {
      dailyGeneration: hourlyData.reduce((sum, h) => sum + h.usefulGeneration, 0),
      monthlySavings: 0,
      annualSavings: 0,
      paybackYears: 0,
      paybackDiscounted: 0,
      roi: 0,
      lcoe: 0,
      gridEnergySaved: energySaved,
      peakShavingSavings: 0,
      arbitrageSavings: 0,
      irr: 0,
      npv: 0
    }
  }
  
  let dailySavings = 0
  let peakSavings = 0
  let arbitrageSavings = 0
  
  // Apply Lei 14.300 compensation factor
  const compensationFactor = tariff.compensationFactor || 1.0
  
  // Calculate arbitrage savings: sell at peak - buy at off-peak
  const arbitrageCost = arbitrageCharge * tariff.offPeakRate
  const arbitrageRevenue = arbitrageDischarge * tariff.peakRate
  arbitrageSavings = (arbitrageRevenue - arbitrageCost) * 30 // Monthly
  
  hourlyData.forEach(h => {
    const savedEnergy = h.usefulGeneration + h.batteryDischarge
    // For GD: TE is 100% compensated, TUSD is compensated according to GD type
    const effectiveRate = h.isPeakHour 
      ? tariff.peakRate * compensationFactor
      : tariff.offPeakRate * compensationFactor
    
    if (h.isPeakHour) {
      dailySavings += savedEnergy * effectiveRate
      peakSavings += savedEnergy * (tariff.peakRate - tariff.offPeakRate) * compensationFactor
    } else {
      dailySavings += savedEnergy * effectiveRate
    }
  })
  
  return {
    dailyGeneration: hourlyData.reduce((sum, h) => sum + h.usefulGeneration, 0),
    monthlySavings: dailySavings * 30 + arbitrageSavings,
    annualSavings: dailySavings * 365 + arbitrageSavings * 12,
    paybackYears: 0,
    paybackDiscounted: 0,
    roi: 0,
    lcoe: 0,
    gridEnergySaved: energySaved,
    peakShavingSavings: peakSavings * 30,
    arbitrageSavings: arbitrageSavings,
    irr: 0,
    npv: 0
  }
}

function calculateSizing(
  consumption: { dailyConsumption: number },
  battery: { enabled: boolean; capacity: number; efficiency: number; dod: number; quantity: number },
  energyDeficit: number
): SizingResults {
  const warnings: string[] = []
  
  if (!battery.enabled) {
    return {
      requiredEnergy: energyDeficit,
      correctedEnergy: 0,
      batteryCount: 0,
      requiredPower: 0,
      totalCapacity: 0,
      systemVoltage: 0,
      peakCurrent: 0,
      warnings: []
    }
  }
  
  const requiredEnergy = energyDeficit
  const dod = battery.dod || 80
  const efficiency = battery.efficiency || 90
  
  // Correct for DOD and efficiency
  const correctedEnergy = requiredEnergy / (dod / 100) / (efficiency / 100)
  
  // Calculate number of batteries needed
  const batteryCount = Math.ceil(correctedEnergy / battery.capacity)
  const totalCapacity = battery.capacity * battery.quantity
  
  if (totalCapacity < correctedEnergy) {
    warnings.push(`Capacidade insuficiente: ${totalCapacity.toFixed(1)} kWh < ${correctedEnergy.toFixed(1)} kWh necessários`)
  }
  
  return {
    requiredEnergy,
    correctedEnergy,
    batteryCount,
    requiredPower: requiredEnergy / 4, // Assuming 4h discharge
    totalCapacity,
    systemVoltage: 48, // Default
    peakCurrent: 0,
    warnings
  }
}

export function generateSyntheticProfile(
  type: 'comercial' | 'industrial' | 'residencial' | 'personalizado',
  dailyConsumption: number
): number[] {
  let baseProfile: number[]
  
  switch (type) {
    case 'comercial':
      baseProfile = [...COMMERCIAL_PROFILE]
      break
    case 'industrial':
      baseProfile = [...INDUSTRIAL_PROFILE]
      break
    case 'residencial':
      baseProfile = [...RESIDENTIAL_PROFILE]
      break
    default:
      baseProfile = Array(24).fill(1)
  }
  
  const profileSum = baseProfile.reduce((a, b) => a + b, 0)
  const scale = dailyConsumption / profileSum
  
  return baseProfile.map(v => v * scale)
}

export function generateDefaultSolarProfile(peakPower: number): number[] {
  return DEFAULT_SOLAR_PROFILE.map(v => v * peakPower)
}

export function generateSolarFromIrradiance(
  installedPower: number,
  performanceRatio: number,
  irradiance: number
): number[] {
  // irradiance in kWh/m²/day
  // Generate hourly profile based on typical solar curve
  const dailyEnergy = installedPower * irradiance * (performanceRatio / 100)
  const solarCurve = DEFAULT_SOLAR_PROFILE
  const curveSum = solarCurve.reduce((a, b) => a + b, 0)
  
  return solarCurve.map(v => (v / curveSum) * dailyEnergy)
}

export function distributeConsumption(dailyTotal: number): number[] {
  // Distribute evenly across 24 hours
  return Array(24).fill(dailyTotal / 24)
}

export function sumHourlyToDaily(hourlyProfile: number[]): number {
  return hourlyProfile.reduce((sum, val) => sum + val, 0)
}
