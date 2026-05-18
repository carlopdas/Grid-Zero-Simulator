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
  
  // Track SOC by origin (solar vs grid)
  let socSolar = battery.enabled ? battery.initialSoc / 2 : 0 // Assume 50% initial is solar
  let socGrid = battery.enabled ? battery.initialSoc / 2 : 0 // Assume 50% initial is grid
  
  const batteryQuantity = battery.quantity || 1
  const totalBatteryCapacity = battery.capacity * batteryQuantity
  const totalChargePower = battery.chargePower * batteryQuantity
  const totalDischargePower = battery.dischargePower * batteryQuantity
  const batteryEfficiency = battery.efficiency || 90
  
  // Counters
  let totalGenerated = 0
  let totalConsumed = 0
  let totalCurtailed = 0
  let totalStored = 0
  let totalStoredSolar = 0
  let totalStoredGrid = 0
  let totalDischarged = 0
  let totalDischargedSolar = 0
  let totalDischargedGrid = 0
  let totalGeneratorUsed = 0
  let totalSolarDirect = 0 // Solar consumed directly (not via battery)
  let potentialExport = 0
  let totalGridImport = 0
  let totalGridExport = 0
  let totalArbitrageCharge = 0
  let totalArbitrageDischarge = 0
  
  // Arbitrage settings
  const arbitrageEnabled = battery.arbitrageEnabled || false
  const arbitrageMinSoc = battery.arbitrageMinSoc || 10
  const arbitrageStrategy: BatteryStrategy = (battery.arbitrageStrategy as BatteryStrategy) || 'auto_optimization'
  const arbitrageDailyLimit = battery.arbitrageDailyLimit || 0
  let arbitrageChargedToday = 0
  
  // Configurable charge/discharge windows
  const chargeWindowStart = battery.chargeWindowStart ?? 21.5
  const chargeWindowEnd = battery.chargeWindowEnd ?? 17.5
  const dischargeWindowStart = battery.dischargeWindowStart ?? 17.5
  const dischargeWindowEnd = battery.dischargeWindowEnd ?? 21.5
  const targetSocAtPeakStart = battery.targetSocAtPeakStart ?? 95
  
  const absoluteMinSoc = Math.max(battery.minSoc || 20, arbitrageMinSoc)
  const maxSocLimit = battery.maxSoc || 100
  
  // Helper function to check if hour is in a window (handles wrap-around)
  const isInWindow = (hour: number, start: number, end: number): boolean => {
    const h = hour + 0.5 // Center of hour
    if (start <= end) {
      return h >= start && h < end
    } else {
      // Window wraps around midnight (e.g., 21:30 to 17:30 next day)
      return h >= start || h < end
    }
  }
  
  for (let hour = 0; hour < 24; hour++) {
    let originalGen = 0
    
    if (analysisMode !== 'load-only') {
      originalGen = generation.hourlyGeneration[hour] || 0
    }
    
    const load = consumption.hourlyProfile[hour] || 0
    const clippedGen = originalGen * (windowClipping / 100)
    
    let usefulGen = 0
    let curtailed = 0
    let batteryCharge = 0
    let batteryChargeSolar = 0
    let batteryChargeGrid = 0
    let batteryDischarge = 0
    let batteryDischargeSolar = 0
    let batteryDischargeGrid = 0
    let generatorOutput = 0
    let deficit = 0
    let gridImport = 0
    let gridExport = 0
    
    const isPeakHour = tariff.enabled && 
      (hour + 0.5) >= tariff.peakHours.start && 
      (hour + 0.5) < tariff.peakHours.end
    
    // Use configurable windows for arbitrage logic
    const isInChargeWindow = isInWindow(hour, chargeWindowStart, chargeWindowEnd)
    const isInDischargeWindow = isInWindow(hour, dischargeWindowStart, dischargeWindowEnd)
    
    if (analysisMode === 'load-only') {
      usefulGen = 0
      deficit = load
      gridImport = load
      totalGridImport += gridImport
    } else if (battery.enabled && arbitrageEnabled && analysisMode === 'pv-bess') {
      // ARBITRAGE MODE
      
      // Step 1: Solar direct consumption
      usefulGen = Math.min(clippedGen, load)
      totalSolarDirect += usefulGen
      let remainingLoad = load - usefulGen
      let excessSolar = clippedGen - usefulGen
      
      // Step 2: Store excess solar
      if (excessSolar > 0 && currentSoc < maxSocLimit) {
        const availableCapacity = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        const maxCharge = Math.min(
          excessSolar,
          totalChargePower,
          availableCapacity / (batteryEfficiency / 100)
        )
        
        const chargeEnergy = maxCharge * (batteryEfficiency / 100)
        batteryCharge += chargeEnergy
        batteryChargeSolar = chargeEnergy
        currentSoc += (chargeEnergy / totalBatteryCapacity) * 100
        socSolar += (chargeEnergy / totalBatteryCapacity) * 100
        currentSoc = Math.min(currentSoc, maxSocLimit)
        excessSolar -= maxCharge
        totalStored += chargeEnergy
        totalStoredSolar += chargeEnergy
      }
      
      curtailed = excessSolar
      totalCurtailed += curtailed
      potentialExport += excessSolar
      
      // Step 3: Battery behavior by strategy
      if (arbitrageStrategy === 'auto_optimization') {
        if (isInDischargeWindow) {
          // DISCHARGE WINDOW (PEAK): Discharge battery
          if (remainingLoad > 0 && currentSoc > absoluteMinSoc) {
            const availableEnergy = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
            const maxDischarge = Math.min(remainingLoad, totalDischargePower, availableEnergy)
            
            // Proportional discharge from solar and grid origins
            const solarRatio = socSolar / (socSolar + socGrid || 1)
            const gridRatio = 1 - solarRatio
            
            batteryDischarge = maxDischarge
            batteryDischargeSolar = maxDischarge * solarRatio
            batteryDischargeGrid = maxDischarge * gridRatio
            
            currentSoc -= (maxDischarge / totalBatteryCapacity) * 100
            socSolar -= (batteryDischargeSolar / totalBatteryCapacity) * 100
            socGrid -= (batteryDischargeGrid / totalBatteryCapacity) * 100
            socSolar = Math.max(0, socSolar)
            socGrid = Math.max(0, socGrid)
            currentSoc = Math.max(currentSoc, absoluteMinSoc)
            
            remainingLoad -= batteryDischarge
            totalDischarged += batteryDischarge
            totalDischargedSolar += batteryDischargeSolar
            totalDischargedGrid += batteryDischargeGrid
            totalArbitrageDischarge += batteryDischargeGrid
          }
          
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        } else if (isInChargeWindow) {
          // CHARGE WINDOW (OFF-PEAK): Buy for load, then charge battery from grid
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
          
          // Charge from grid for arbitrage
          const dailyLimit = arbitrageDailyLimit > 0 
            ? Math.max(0, arbitrageDailyLimit - arbitrageChargedToday)
            : Infinity
          
          const availableCapacity = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
          const remainingChargePower = totalChargePower - (batteryCharge / (batteryEfficiency / 100))
          const maxArbitrageCharge = Math.min(
            availableCapacity / (batteryEfficiency / 100),
            remainingChargePower,
            dailyLimit
          )
          
          if (maxArbitrageCharge > 0.1 && currentSoc < maxSocLimit) {
            const chargeEnergy = maxArbitrageCharge * (batteryEfficiency / 100)
            batteryCharge += chargeEnergy
            batteryChargeGrid = chargeEnergy
            currentSoc += (chargeEnergy / totalBatteryCapacity) * 100
            socGrid += (chargeEnergy / totalBatteryCapacity) * 100
            currentSoc = Math.min(currentSoc, maxSocLimit)
            gridImport += maxArbitrageCharge
            totalGridImport += maxArbitrageCharge
            totalArbitrageCharge += maxArbitrageCharge
            arbitrageChargedToday += maxArbitrageCharge
            totalStored += chargeEnergy
            totalStoredGrid += chargeEnergy
          }
        } else {
          // OUTSIDE WINDOWS: Just buy from grid for load (no battery action)
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        }
      } else if (arbitrageStrategy === 'solar_only') {
        // Discharge for self-consumption anytime
        if (remainingLoad > 0 && currentSoc > absoluteMinSoc) {
          const availableEnergy = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
          const maxDischarge = Math.min(remainingLoad, totalDischargePower, availableEnergy)
          
          batteryDischarge = maxDischarge
          batteryDischargeSolar = maxDischarge // All from solar
          
          currentSoc -= (maxDischarge / totalBatteryCapacity) * 100
          socSolar -= (maxDischarge / totalBatteryCapacity) * 100
          socSolar = Math.max(0, socSolar)
          currentSoc = Math.max(currentSoc, absoluteMinSoc)
          
          remainingLoad -= batteryDischarge
          totalDischarged += batteryDischarge
          totalDischargedSolar += batteryDischargeSolar
        }
        
        if (remainingLoad > 0) {
          gridImport = remainingLoad
          totalGridImport += gridImport
          deficit = remainingLoad
        }
      } else if (arbitrageStrategy === 'arbitrage_only') {
        if (isInDischargeWindow) {
          // DISCHARGE WINDOW: Discharge maximum
          if (currentSoc > absoluteMinSoc) {
            const availableEnergy = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
            const maxDischarge = Math.min(totalDischargePower, availableEnergy)
            
            const solarRatio = socSolar / (socSolar + socGrid || 1)
            
            batteryDischarge = maxDischarge
            batteryDischargeSolar = maxDischarge * solarRatio
            batteryDischargeGrid = maxDischarge * (1 - solarRatio)
            
            currentSoc -= (maxDischarge / totalBatteryCapacity) * 100
            socSolar -= (batteryDischargeSolar / totalBatteryCapacity) * 100
            socGrid -= (batteryDischargeGrid / totalBatteryCapacity) * 100
            socSolar = Math.max(0, socSolar)
            socGrid = Math.max(0, socGrid)
            currentSoc = Math.max(currentSoc, absoluteMinSoc)
            
            const dischargeForLoad = Math.min(batteryDischarge, remainingLoad)
            remainingLoad -= dischargeForLoad
            totalDischarged += batteryDischarge
            totalDischargedSolar += batteryDischargeSolar
            totalDischargedGrid += batteryDischargeGrid
            totalArbitrageDischarge += batteryDischargeGrid
          }
          
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        } else if (isInChargeWindow) {
          // CHARGE WINDOW: Buy for load and charge battery
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
          
          const dailyLimit = arbitrageDailyLimit > 0 
            ? Math.max(0, arbitrageDailyLimit - arbitrageChargedToday)
            : Infinity
          
          const availableCapacity = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
          const remainingChargePower = totalChargePower - (batteryCharge / (batteryEfficiency / 100))
          const maxArbitrageCharge = Math.min(
            availableCapacity / (batteryEfficiency / 100),
            remainingChargePower,
            dailyLimit
          )
          
          if (maxArbitrageCharge > 0.1 && currentSoc < maxSocLimit) {
            const chargeEnergy = maxArbitrageCharge * (batteryEfficiency / 100)
            batteryCharge += chargeEnergy
            batteryChargeGrid = chargeEnergy
            currentSoc += (chargeEnergy / totalBatteryCapacity) * 100
            socGrid += (chargeEnergy / totalBatteryCapacity) * 100
            currentSoc = Math.min(currentSoc, maxSocLimit)
            gridImport += maxArbitrageCharge
            totalGridImport += maxArbitrageCharge
            totalArbitrageCharge += maxArbitrageCharge
            arbitrageChargedToday += maxArbitrageCharge
            totalStored += chargeEnergy
            totalStoredGrid += chargeEnergy
          }
        } else {
          // OUTSIDE WINDOWS: Just buy from grid for load
          if (remainingLoad > 0) {
            gridImport = remainingLoad
            totalGridImport += gridImport
            deficit = remainingLoad
          }
        }
      }
    } else if (clippedGen >= load) {
      // NON-ARBITRAGE: Gen >= Load
      usefulGen = load
      totalSolarDirect += load
      let excess = clippedGen - load
      potentialExport += excess
      
      if (battery.enabled && excess > 0 && analysisMode === 'pv-bess') {
        const availableCapacity = totalBatteryCapacity * (maxSocLimit - currentSoc) / 100
        const maxCharge = Math.min(
          excess,
          totalChargePower,
          availableCapacity / (batteryEfficiency / 100)
        )
        
        batteryCharge = maxCharge * (batteryEfficiency / 100)
        batteryChargeSolar = batteryCharge
        currentSoc += (batteryCharge / totalBatteryCapacity) * 100
        socSolar += (batteryCharge / totalBatteryCapacity) * 100
        currentSoc = Math.min(currentSoc, maxSocLimit)
        excess -= maxCharge
        totalStored += batteryCharge
        totalStoredSolar += batteryCharge
      }
      
      curtailed = excess
      totalCurtailed += curtailed
    } else {
      // NON-ARBITRAGE: Load > Gen
      usefulGen = clippedGen
      totalSolarDirect += clippedGen
      let remaining = load - clippedGen
      
      if (battery.enabled && remaining > 0 && currentSoc > absoluteMinSoc && analysisMode === 'pv-bess') {
        const availableEnergy = totalBatteryCapacity * (currentSoc - absoluteMinSoc) / 100
        const maxDischarge = Math.min(remaining, totalDischargePower, availableEnergy)
        
        const solarRatio = socSolar / (socSolar + socGrid || 1)
        
        batteryDischarge = maxDischarge
        batteryDischargeSolar = maxDischarge * solarRatio
        batteryDischargeGrid = maxDischarge * (1 - solarRatio)
        
        currentSoc -= (maxDischarge / totalBatteryCapacity) * 100
        socSolar -= (batteryDischargeSolar / totalBatteryCapacity) * 100
        socGrid -= (batteryDischargeGrid / totalBatteryCapacity) * 100
        socSolar = Math.max(0, socSolar)
        socGrid = Math.max(0, socGrid)
        currentSoc = Math.max(currentSoc, absoluteMinSoc)
        
        remaining -= batteryDischarge
        totalDischarged += batteryDischarge
        totalDischargedSolar += batteryDischargeSolar
        totalDischargedGrid += batteryDischargeGrid
      }
      
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
      socSolar: battery.enabled ? socSolar : 0,
      socGrid: battery.enabled ? socGrid : 0,
      batteryCharge,
      batteryChargeSolar,
      batteryChargeGrid,
      batteryDischarge,
      batteryDischargeSolar,
      batteryDischargeGrid,
      generatorOutput,
      deficit,
      gridExport: 0,
      gridImport,
      isPeakHour
    })
  }
  
  const selfConsumption = totalSolarDirect + totalDischargedSolar + totalDischargedGrid
  const selfConsumptionPercent = totalGenerated > 0 
    ? (selfConsumption / totalGenerated) * 100 
    : 0
  const curtailedPercent = totalGenerated > 0 
    ? (totalCurtailed / totalGenerated) * 100 
    : 0
  const energyIndependence = totalConsumed > 0 
    ? (selfConsumption / totalConsumed) * 100 
    : 0

  // Economic calculations with proper breakdown
  const economic = calculateEconomics(
    hourlyData, 
    tariff, 
    totalSolarDirect,
    totalDischargedSolar,
    totalDischargedGrid,
    totalArbitrageCharge,
    totalArbitrageDischarge
  )
  
  const sizing = calculateSizing(
    consumption,
    battery,
    totalConsumed - selfConsumption
  )
  
  return {
    hourlyData,
    totalGenerated,
    totalConsumed,
    selfConsumption,
    selfConsumptionPercent: Math.min(selfConsumptionPercent, 100),
    curtailedEnergy: totalCurtailed,
    curtailedPercent,
    storedEnergy: totalStored,
    dischargedEnergy: totalDischarged,
    generatorEnergy: totalGeneratorUsed,
    energyIndependence: Math.min(energyIndependence, 100),
    potentialExport,
    effectivelyUsed: selfConsumption + totalStored,
    gridImport: totalGridImport,
    gridExport: totalGridExport,
    economic,
    sizing
  }
}

function calculateEconomics(
  hourlyData: HourlySimulationResult[],
  tariff: { 
    enabled: boolean
    energyRate: number
    peakRate: number
    offPeakRate: number
    compensationFactor?: number
    te?: number
    tusd?: number
    demandRate?: number
    contractedDemand?: number
    currentMonthlyBill?: number
  },
  solarDirectKwh: number,
  batterySolarKwh: number,
  batteryGridKwh: number,
  arbitrageChargeKwh: number,
  arbitrageDischargeKwh: number
): EconomicResults {
  const defaultResult: EconomicResults = {
    dailyGeneration: hourlyData.reduce((sum, h) => sum + h.usefulGeneration, 0),
    dailySolarDirectKwh: solarDirectKwh,
    dailyBatterySolarKwh: batterySolarKwh,
    dailyBatteryGridKwh: batteryGridKwh,
    dailyArbitrageChargeKwh: arbitrageChargeKwh,
    dailyArbitrageDischargeKwh: arbitrageDischargeKwh,
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
    currentMonthlyBill: tariff.currentMonthlyBill || 0,
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
    peakCoveragePercent: 100,
    gridEnergySaved: solarDirectKwh + batterySolarKwh
  }
  
  if (!tariff.enabled) {
    return defaultResult
  }
  
  const compensationFactor = tariff.compensationFactor || 1.0
  const currentMonthlyBill = tariff.currentMonthlyBill || 0
  const demandRate = tariff.demandRate || 0
  
  // ============================================
  // CALCULO HORA A HORA COM TARIFA DO HORARIO
  // ============================================
  
  let solarDirectPeakKwh = 0
  let solarDirectOffPeakKwh = 0
  let batterySolarPeakKwh = 0
  let batterySolarOffPeakKwh = 0
  let batteryGridPeakKwh = 0
  let batteryGridOffPeakKwh = 0
  
  let solarDirectSavingsHourly = 0
  let batterySolarSavingsHourly = 0
  
  // Track demand for peak shaving
  let originalPeakDemandKw = 0
  let reducedPeakDemandKw = 0
  let totalPeakDeficitKwh = 0
  let totalPeakLoadKwh = 0
  
  hourlyData.forEach(h => {
    const rate = h.isPeakHour ? tariff.peakRate : tariff.offPeakRate
    
    // Solar direct consumption - uses tariff of the hour
    solarDirectSavingsHourly += h.usefulGeneration * rate * compensationFactor
    
    if (h.isPeakHour) {
      solarDirectPeakKwh += h.usefulGeneration
      batterySolarPeakKwh += h.batteryDischargeSolar
      batteryGridPeakKwh += h.batteryDischargeGrid
    } else {
      solarDirectOffPeakKwh += h.usefulGeneration
      batterySolarOffPeakKwh += h.batteryDischargeSolar
      batteryGridOffPeakKwh += h.batteryDischargeGrid
    }
    
    // Battery solar discharge - uses tariff of the hour
    batterySolarSavingsHourly += h.batteryDischargeSolar * rate * compensationFactor
    
    // Track demand (load) for peak shaving
    if (h.isPeakHour) {
      const originalDemand = h.load
      const reducedDemand = h.load - h.usefulGeneration - h.batteryDischarge
      totalPeakLoadKwh += h.load
      totalPeakDeficitKwh += Math.max(0, reducedDemand)
      
      if (originalDemand > originalPeakDemandKw) {
        originalPeakDemandKw = originalDemand
      }
      if (reducedDemand > reducedPeakDemandKw) {
        reducedPeakDemandKw = Math.max(0, reducedDemand)
      }
    }
  })
  
  // ============================================
  // MONTHLY SAVINGS (x30)
  // ============================================
  
  // 1. Eco_Solar_Direta = soma hora a hora x 30
  const solarDirectSavings = solarDirectSavingsHourly * 30
  
  // 2. Eco_Bateria_Solar = soma hora a hora x 30
  const batterySolarSavings = batterySolarSavingsHourly * 30
  
  // 3. Eco_Peak_Shaving = reducao_demanda_kW x tarifa_demanda_R$/kW
  // CORRIGIDO: Usa tarifa de demanda, nao energia
  const demandReductionKw = Math.max(0, originalPeakDemandKw - reducedPeakDemandKw)
  const peakShavingSavings = demandReductionKw * demandRate
  
  // 4. Eco_Arbitragem = (Descarga_Ponta x Tarifa_Ponta) - (Compra_FP x Tarifa_FP) x 30
  // Energia de arbitragem descarregada na ponta
  const arbitrageBenefit = batteryGridPeakKwh * 30 * tariff.peakRate
  const arbitrageCost = arbitrageChargeKwh * 30 * tariff.offPeakRate
  const arbitrageNetSavings = Math.max(0, arbitrageBenefit - arbitrageCost)
  
  // ============================================
  // TOTAL BRUTO (antes do teto)
  // ============================================
  const grossMonthlySavings = solarDirectSavings + batterySolarSavings + peakShavingSavings + arbitrageNetSavings
  
  // ============================================
  // APLICAR TETO DE 95% DA FATURA
  // ============================================
  let monthlySavings = grossMonthlySavings
  let savingsCapApplied = false
  let savingsCapPercent = 0
  
  if (currentMonthlyBill > 0) {
    const maxSavings = currentMonthlyBill * 0.95
    savingsCapPercent = (grossMonthlySavings / currentMonthlyBill) * 100
    
    if (grossMonthlySavings > maxSavings) {
      monthlySavings = maxSavings
      savingsCapApplied = true
    }
  }
  
  const dailySavings = monthlySavings / 30
  const annualSavings = monthlySavings * 12
  
  // ============================================
  // ANALISE MARGINAL - DIMENSIONAMENTO OTIMO
  // ============================================
  // Peak coverage = quanto da carga na ponta foi atendido
  const peakCoveragePercent = totalPeakLoadKwh > 0 
    ? ((totalPeakLoadKwh - totalPeakDeficitKwh) / totalPeakLoadKwh) * 100 
    : 100
  
  // Marginal analysis: would adding one more battery be worth it?
  // Assume each additional battery adds ~80% of its capacity in peak coverage
  // Additional savings = (additional kWh covered in peak) * (peakRate - offPeakRate) * 30
  const additionalBatteryKwh = 100 // Assume 100 kWh per additional battery unit
  const additionalPeakCoverageKwh = Math.min(totalPeakDeficitKwh, additionalBatteryKwh * 0.8)
  const marginalSavingsPerBattery = additionalPeakCoverageKwh * (tariff.peakRate - tariff.offPeakRate) * 30
  
  // Marginal payback = cost of one battery / annual marginal savings
  const batteryCostPerKwh = 1500 // Default R$/kWh, should come from input
  const marginalBatteryCost = additionalBatteryKwh * batteryCostPerKwh
  const marginalPaybackYears = marginalSavingsPerBattery > 0 
    ? marginalBatteryCost / (marginalSavingsPerBattery * 12) 
    : Infinity
  
  // System is optimally sized if:
  // 1. Peak coverage is > 90% OR
  // 2. Marginal payback > 10 years OR
  // 3. Peak deficit is very small (< 10 kWh/dia)
  const isOptimallySized = peakCoveragePercent > 90 || marginalPaybackYears > 10 || totalPeakDeficitKwh < 10
  
  return {
    dailyGeneration: hourlyData.reduce((sum, h) => sum + h.usefulGeneration, 0),
    dailySolarDirectKwh: solarDirectKwh,
    dailyBatterySolarKwh: batterySolarKwh,
    dailyBatteryGridKwh: batteryGridKwh,
    dailyArbitrageChargeKwh: arbitrageChargeKwh,
    dailyArbitrageDischargeKwh: arbitrageDischargeKwh,
    solarDirectPeakKwh,
    solarDirectOffPeakKwh,
    batterySolarPeakKwh,
    batterySolarOffPeakKwh,
    solarDirectSavings,
    batterySolarSavings,
    peakShavingSavings,
    arbitrageBenefit,
    arbitrageCost,
    arbitrageNetSavings,
    grossMonthlySavings,
    monthlySavings,
    annualSavings,
    dailySavings,
    currentMonthlyBill,
    savingsCapApplied,
    savingsCapPercent,
    originalPeakDemandKw,
    reducedPeakDemandKw,
    demandReductionKw,
    paybackYears: 0,
    paybackDiscounted: 0,
    roi: 0,
    lcoe: 0,
    irr: 0,
    npv: 0,
    marginalSavingsPerBattery,
    marginalPaybackYears,
    isOptimallySized,
    peakDeficitKwh: totalPeakDeficitKwh,
    peakCoveragePercent,
    gridEnergySaved: solarDirectKwh + batterySolarKwh
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
  
  const correctedEnergy = requiredEnergy / (dod / 100) / (efficiency / 100)
  const batteryCount = Math.ceil(correctedEnergy / battery.capacity)
  const totalCapacity = battery.capacity * battery.quantity
  const usableCapacity = totalCapacity * (dod / 100)
  
  // CORRIGIDO: Nao mostrar aviso de "capacidade insuficiente" baseado em deficit total
  // Em vez disso, mostrar informacao sobre cobertura
  // O aviso de otimizacao economica e feito na EconomicResults agora
  
  return {
    requiredEnergy,
    correctedEnergy,
    batteryCount,
    requiredPower: requiredEnergy / 4,
    totalCapacity,
    systemVoltage: 48,
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
  const totalDaily = peakPower * 4.5
  const sum = DEFAULT_SOLAR_PROFILE.reduce((a, b) => a + b, 0)
  return DEFAULT_SOLAR_PROFILE.map(v => (v / sum) * totalDaily)
}

export function generateSolarFromIrradiance(
  installedPower: number,
  performanceRatio: number,
  irradiance: number
): number[] {
  const pr = performanceRatio / 100
  const dailyGeneration = installedPower * irradiance * pr
  const sum = DEFAULT_SOLAR_PROFILE.reduce((a, b) => a + b, 0)
  return DEFAULT_SOLAR_PROFILE.map(v => (v / sum) * dailyGeneration)
}
