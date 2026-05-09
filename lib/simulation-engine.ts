import {
  SimulationInputs,
  SimulationResults,
  HourlySimulationResult,
} from './grid-zero-types'

export function runGridZeroSimulation(inputs: SimulationInputs): SimulationResults {
  const { consumption, generation, windowClipping, battery, generator } = inputs
  
  const hourlyData: HourlySimulationResult[] = []
  let currentSoc = battery.enabled ? battery.initialSoc : 0
  
  let totalGenerated = 0
  let totalConsumed = 0
  let totalCurtailed = 0
  let totalStored = 0
  let totalDischarged = 0
  let totalGeneratorUsed = 0
  let totalSelfConsumed = 0
  let potentialExport = 0
  
  for (let hour = 0; hour < 24; hour++) {
    const originalGen = generation.hourlyGeneration[hour] || 0
    const load = consumption.hourlyProfile[hour] || 0
    
    // Apply window clipping
    const clippedGen = originalGen * (windowClipping / 100)
    
    let usefulGen = 0
    let curtailed = 0
    let batteryCharge = 0
    let batteryDischarge = 0
    let generatorOutput = 0
    let deficit = 0
    
    // Grid Zero Logic
    if (clippedGen >= load) {
      // Case 1: Generation exceeds load
      usefulGen = load // Only use what's needed for load
      let excess = clippedGen - load
      potentialExport += excess
      
      // Try to store excess in battery
      if (battery.enabled && excess > 0) {
        const availableCapacity = (battery.capacity * (100 - currentSoc) / 100)
        const maxCharge = Math.min(
          excess,
          battery.chargePower,
          availableCapacity / (battery.efficiency / 100)
        )
        batteryCharge = maxCharge * (battery.efficiency / 100)
        currentSoc += (batteryCharge / battery.capacity) * 100
        currentSoc = Math.min(currentSoc, 100)
        excess -= maxCharge
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
      
      // Try to discharge battery
      if (battery.enabled && remaining > 0 && currentSoc > battery.minSoc) {
        const availableEnergy = battery.capacity * (currentSoc - battery.minSoc) / 100
        const maxDischarge = Math.min(
          remaining,
          battery.dischargePower,
          availableEnergy
        )
        batteryDischarge = maxDischarge
        currentSoc -= (batteryDischarge / battery.capacity) * 100
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
      gridExport: 0 // Always zero in Grid Zero mode
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
    effectivelyUsed: totalSelfConsumed + totalStored
  }
}

export function generateSyntheticProfile(
  type: 'comercial' | 'industrial' | 'personalizado',
  dailyConsumption: number
): number[] {
  const baseProfile = type === 'comercial' 
    ? [0.2, 0.15, 0.1, 0.1, 0.15, 0.3, 0.5, 0.8, 1.0, 1.0, 1.0, 0.9, 0.85, 0.9, 1.0, 1.0, 0.95, 0.8, 0.6, 0.4, 0.35, 0.3, 0.25, 0.22]
    : type === 'industrial'
    ? [0.6, 0.6, 0.6, 0.6, 0.65, 0.75, 0.9, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.95, 1.0, 1.0, 1.0, 0.95, 0.85, 0.75, 0.7, 0.65, 0.6, 0.6]
    : Array(24).fill(1)
  
  const profileSum = baseProfile.reduce((a, b) => a + b, 0)
  const scale = dailyConsumption / profileSum
  
  return baseProfile.map(v => v * scale)
}

export function generateDefaultSolarProfile(peakPower: number): number[] {
  const solarCurve = [
    0, 0, 0, 0, 0, 0.05, 0.15, 0.35, 0.55, 0.75,
    0.9, 0.95, 1.0, 0.95, 0.85, 0.7, 0.5, 0.3, 0.1, 0.02,
    0, 0, 0, 0
  ]
  return solarCurve.map(v => v * peakPower)
}
