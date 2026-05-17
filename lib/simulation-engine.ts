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
  BatteryStrategy,
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
  
  // Arbitrage tracking - FIXED LOGIC
  const arbitrageEnabled = battery.arbitrageEnabled || false
  const arbitrageMinSoc = battery.arbitrageMinSoc || 10 // Emergency reserve - NEVER go below
  const arbitrageStrategy: BatteryStrategy = (battery.arbitrageStrategy as BatteryStrategy) || 'auto_optimization'
  const arbitrageDailyLimit = battery.arbitrageDailyLimit || 0
  let arbitrageChargedToday = 0
  
  // Min SOC limits
  const absoluteMinSoc = Math.max(battery.minSoc || 20, arbitrageMinSoc) // Never go below this
  const maxSocLimit = battery.maxSoc || 100
  
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
    
    // FIXED: Check peak hour with half-hour precision
    const isPeakHour = tariff.enabled && 
      (hour + 0.5) >= tariff.peakHours.start && 
      (hour + 0.5) < tariff.peakHours.end
    
    // ============================================
    // CORE LOGIC: Depends on strategy and time
    // ============================================
    
    if (analysisMode === 'load-only') {
      // Load only - no generation, no battery
      usefulGen = 0
      deficit = load
      gridImport = load
      totalGridImport += gridImport
    } else if (battery.enabled && arbitrageEnabled && analysisMode === 'pv-bess') {
      // ============================================
      // ARBITRAGE MODE - CORRECTED LOGIC
      // ============================================
      
      // Step 1: Use solar generation first (always)
      usefulGen = Math.min(clippedGen, load)
      totalSelfConsumed += usefulGen
      let remainingLoad = load - usefulGen
      let excessSolar = clippedGen - usefulGen
      
      // Step 2: Store excess solar in battery (always, regardless of strategy)
      if (excessSolar > 0 && currentSoc < maxSocLimit) {
        const availableCapacityKwh = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        const maxChargeEnergy = Math.min(
          excessSolar,
          totalChargePower,
          availableCapacityKwh / (batteryEfficiency / 100)
        )
        
        const chargeEnergy = maxChargeEnergy * (batteryEfficiency / 100)
        batteryCharge += chargeEnergy
        currentSoc += (chargeEnergy / totalBatteryCapacity) * 100
        currentSoc = Math.min(currentSoc, maxSocLimit)
        excessSolar -= maxChargeEnergy
        totalStored += chargeEnergy
      }
      
      // Remaining excess is curtailed
      curtailed = excessSolar
      totalCurtailed += curtailed
      potentialExport += excessSolar
      
      // Step 3: Battery behavior depends on strategy and time
      if (arbitrageStrategy === 'auto_optimization') {
        // ============================================
        // AUTO OPTIMIZATION STRATEGY (RECOMMENDED)
        // - Off-peak: Charge from grid (buy cheap)
        // - Peak: Discharge to cover load (avoid expensive)
        // - Also uses battery for self-consumption when solar insufficient
        // ============================================
        
        if (isPeakHour) {
          // PEAK HOUR: Discharge battery to cover load
          if (remainingLoad > 0 && currentSoc > absoluteMinSoc) {
            const availableEnergyKwh = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
            const maxDischargeEnergy = Math.min(
              remainingLoad,
              totalDischargePower,
              availableEnergyKwh
            )
            
            batteryDischarge = maxDischargeEnergy
            currentSoc -= (batteryDischarge / totalBatteryCapacity) * 100
            currentSoc = Math.max(currentSoc, absoluteMinSoc)
            remainingLoad -= batteryDischarge
            totalDischarged += batteryDischarge
            totalArbitrageDischarge += batteryDischarge
            totalSelfConsumed += batteryDischarge
          }
          
          // If still remaining load, import from grid (expensive)
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        } else {
          // OFF-PEAK HOUR: DO NOT discharge for load (buy cheap instead)
          // Only discharge if strategy is solar_only or grid unavailable
          
          // First: Import from grid to cover remaining load (cheap)
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
          
          // Then: Charge battery from grid for tomorrow's peak
          const dailyLimitRemaining = arbitrageDailyLimit > 0 
            ? Math.max(0, arbitrageDailyLimit - arbitrageChargedToday)
            : Infinity
          
          const availableCapacityKwh = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
          const maxArbitrageCharge = Math.min(
            availableCapacityKwh / (batteryEfficiency / 100),
            totalChargePower - (batteryCharge / (batteryEfficiency / 100)), // Remaining charge power
            dailyLimitRemaining
          )
          
          if (maxArbitrageCharge > 0.1 && currentSoc < maxSocLimit) {
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
        }
        
      } else if (arbitrageStrategy === 'solar_only') {
        // ============================================
        // SOLAR ONLY STRATEGY
        // - Only charge battery from solar excess
        // - Discharge for self-consumption anytime
        // - NO grid charging
        // ============================================
        
        // Discharge to cover remaining load (any hour)
        if (remainingLoad > 0 && currentSoc > absoluteMinSoc) {
          const availableEnergyKwh = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
          const maxDischargeEnergy = Math.min(
            remainingLoad,
            totalDischargePower,
            availableEnergyKwh
          )
          
          batteryDischarge = maxDischargeEnergy
          currentSoc -= (batteryDischarge / totalBatteryCapacity) * 100
          currentSoc = Math.max(currentSoc, absoluteMinSoc)
          remainingLoad -= batteryDischarge
          totalDischarged += batteryDischarge
          totalSelfConsumed += batteryDischarge
        }
        
        // Import remaining from grid
        if (remainingLoad > 0) {
          gridImport = remainingLoad
          totalGridImport += gridImport
          deficit = remainingLoad
        }
        
      } else if (arbitrageStrategy === 'arbitrage_only') {
        // ============================================
        // ARBITRAGE ONLY STRATEGY
        // - Off-peak: Charge from grid ONLY (ignore load)
        // - Peak: Discharge FULLY (ignore load, just sell/offset)
        // ============================================
        
        if (isPeakHour) {
          // Discharge maximum possible
          if (currentSoc > absoluteMinSoc) {
            const availableEnergyKwh = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
            const maxDischargeEnergy = Math.min(
              totalDischargePower,
              availableEnergyKwh
            )
            
            batteryDischarge = maxDischargeEnergy
            currentSoc -= (batteryDischarge / totalBatteryCapacity) * 100
            currentSoc = Math.max(currentSoc, absoluteMinSoc)
            totalDischarged += batteryDischarge
            totalArbitrageDischarge += batteryDischarge
            
            // Use discharge to cover load first
            const dischargeForLoad = Math.min(batteryDischarge, remainingLoad)
            remainingLoad -= dischargeForLoad
            totalSelfConsumed += dischargeForLoad
          }
          
          // Import remaining from grid
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        } else {
          // Off-peak: Import for load AND charge battery
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
          
          // Charge battery from grid
          const dailyLimitRemaining = arbitrageDailyLimit > 0 
            ? Math.max(0, arbitrageDailyLimit - arbitrageChargedToday)
            : Infinity
          
          const availableCapacityKwh = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
          const maxArbitrageCharge = Math.min(
            availableCapacityKwh / (batteryEfficiency / 100),
            totalChargePower - (batteryCharge / (batteryEfficiency / 100)),
            dailyLimitRemaining
          )
          
          if (maxArbitrageCharge > 0.1 && currentSoc < maxSocLimit) {
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
        }
      }
      
    } else if (clippedGen >= load) {
      // ============================================
      // NON-ARBITRAGE: Generation exceeds load
      // ============================================
      usefulGen = load
      let excess = clippedGen - load
      potentialExport += excess
      
      // Try to store excess in battery
      if (battery.enabled && excess > 0 && analysisMode === 'pv-bess') {
        const availableCapacityKwh = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        const maxChargeEnergy = Math.min(
          excess,
          totalChargePower,
          availableCapacityKwh / (batteryEfficiency / 100)
        )
        
        batteryCharge = maxChargeEnergy * (batteryEfficiency / 100)
        currentSoc += (batteryCharge / totalBatteryCapacity) * 100
        currentSoc = Math.min(currentSoc, maxSocLimit)
        excess -= maxChargeEnergy
        totalStored += batteryCharge
      }
      
      curtailed = excess
      totalCurtailed += curtailed
      totalSelfConsumed += load
    } else {
      // ============================================
      // NON-ARBITRAGE: Load exceeds generation
      // ============================================
      usefulGen = clippedGen
      totalSelfConsumed += clippedGen
      let remaining = load - clippedGen
      
      // Try to discharge battery
      if (battery.enabled && remaining > 0 && currentSoc > absoluteMinSoc && analysisMode === 'pv-bess') {
        const availableEnergyKwh = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
        const maxDischargeEnergy = Math.min(
          remaining,
          totalDischargePower,
          availableEnergyKwh
        )
        
        batteryDischarge = maxDischargeEnergy
        currentSoc -= (batteryDischarge / totalBatteryCapacity) * 100
        currentSoc = Math.max(currentSoc, absoluteMinSoc)
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
    ? ((totalSelfConsumed) / totalConsumed) * 100 
    : 0

  // Economic calculations
  const economic = calculateEconomics(
    hourlyData, 
    tariff, 
    totalConsumed, 
    totalSelfConsumed,
    totalArbitrageCharge,
    totalArbitrageDischarge
  )
  
  // Sizing calculations
  const sizing = calculateSizing(
    consumption,
    battery,
    totalConsumed - totalSelfConsumed
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
