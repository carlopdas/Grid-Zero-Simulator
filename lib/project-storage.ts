import { 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  GeneratorConfig, 
  TariffConfig, 
  AnalysisMode 
} from './grid-zero-types'

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  consumption: ConsumptionProfile
  generation: GenerationData
  battery: BatteryConfig
  generator: GeneratorConfig
  tariff: TariffConfig
  analysisMode: AnalysisMode
  windowClipping: number
}

const STORAGE_KEY = 'grid-zero-projects'

export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function getAllProjects(): Project[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Project[]
  } catch {
    return []
  }
}

export function saveProject(project: Project): void {
  if (typeof window === 'undefined') return
  
  const projects = getAllProjects()
  const existingIndex = projects.findIndex(p => p.id === project.id)
  
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...project, updatedAt: new Date().toISOString() }
  } else {
    projects.push(project)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return
  
  const projects = getAllProjects().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects()
  return projects.find(p => p.id === id) || null
}

export function createNewProject(
  name: string,
  consumption: ConsumptionProfile,
  generation: GenerationData,
  battery: BatteryConfig,
  generator: GeneratorConfig,
  tariff: TariffConfig,
  analysisMode: AnalysisMode,
  windowClipping: number
): Project {
  const now = new Date().toISOString()
  return {
    id: generateProjectId(),
    name,
    createdAt: now,
    updatedAt: now,
    consumption,
    generation,
    battery,
    generator,
    tariff,
    analysisMode,
    windowClipping
  }
}
