"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Project, getAllProjects, saveProject, deleteProject, createNewProject } from "@/lib/project-storage"
import { 
  ConsumptionProfile, 
  GenerationData, 
  BatteryConfig, 
  GeneratorConfig, 
  TariffConfig, 
  AnalysisMode 
} from "@/lib/grid-zero-types"
import { Save, FolderOpen, Trash2, ChevronDown, Plus, FileText, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRef } from "react"

interface ProjectManagerProps {
  projectName: string
  projectId: string | null
  onProjectNameChange: (name: string) => void
  onProjectLoad: (project: Project) => void
  onNewProject: () => void
  consumption: ConsumptionProfile
  generation: GenerationData
  battery: BatteryConfig
  generator: GeneratorConfig
  tariff: TariffConfig
  analysisMode: AnalysisMode
  windowClipping: number
}

export function ProjectManager({
  projectName,
  projectId,
  onProjectNameChange,
  onProjectLoad,
  onNewProject,
  consumption,
  generation,
  battery,
  generator,
  tariff,
  analysisMode,
  windowClipping
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProjects(getAllProjects())
  }, [])

  const handleSave = () => {
    if (!projectName.trim()) {
      toast.error("Digite um nome para o projeto")
      return
    }

    const project = createNewProject(
      projectName,
      consumption,
      generation,
      battery,
      generator,
      tariff,
      analysisMode,
      windowClipping
    )
    
    if (projectId) {
      project.id = projectId
    }

    saveProject(project)
    setProjects(getAllProjects())
    setSaveDialogOpen(false)
    toast.success("Projeto salvo com sucesso!")
  }

  const handleLoad = (project: Project) => {
    onProjectLoad(project)
    setLoadDialogOpen(false)
    toast.success(`Projeto "${project.name}" carregado`)
  }

  const handleDelete = (id: string, name: string) => {
    deleteProject(id)
    setProjects(getAllProjects())
    toast.success(`Projeto "${name}" excluido`)
  }

  // Export project to .gridzero file
  const handleExport = () => {
    const projectData = {
      version: "3.0",
      exportedAt: new Date().toISOString(),
      name: projectName || "Projeto Grid-Zero",
      consumption,
      generation,
      battery,
      generator,
      tariff,
      analysisMode,
      windowClipping
    }
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'projeto'}.gridzero`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Projeto exportado com sucesso!")
  }

  // Import project from .gridzero file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const projectData = JSON.parse(content)
        
        // Validate project data
        if (!projectData.consumption || !projectData.generation) {
          toast.error("Arquivo de projeto invalido")
          return
        }
        
        // Create project object for loading
        const project: Project = {
          id: `imported-${Date.now()}`,
          name: projectData.name || file.name.replace('.gridzero', '').replace('.json', ''),
          consumption: projectData.consumption,
          generation: projectData.generation,
          battery: projectData.battery || battery,
          generator: projectData.generator || generator,
          tariff: projectData.tariff || tariff,
          analysisMode: projectData.analysisMode || 'pv-bess',
          windowClipping: projectData.windowClipping || 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        onProjectLoad(project)
        onProjectNameChange(project.name)
        toast.success(`Projeto "${project.name}" importado com sucesso!`)
      } catch (error) {
        toast.error("Erro ao ler arquivo de projeto")
        console.error("Import error:", error)
      }
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Project Name Input */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Nome do Projeto"
          className="h-8 w-40 text-sm"
        />
      </div>

      {/* Save Button */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Save className="h-3 w-3" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Projeto</DialogTitle>
            <DialogDescription>
              Salve sua configuracao para editar posteriormente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome do Projeto / Cliente</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                placeholder="Ex: Fazenda Solar Norte"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="btn-gradient">
              <Save className="mr-2 h-4 w-4" />
              Salvar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Projects Dropdown */}
      <DropdownMenu open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <FolderOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Abrir</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Projetos Salvos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.length === 0 ? (
            <DropdownMenuItem disabled>
              Nenhum projeto salvo
            </DropdownMenuItem>
          ) : (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                className="flex items-center justify-between"
              >
                <button
                  onClick={() => handleLoad(project)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(project.id, project.name)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onNewProject}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Button */}
      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
        <Download className="h-3 w-3" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>

      {/* Import Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gridzero,.json"
        onChange={handleImport}
        className="hidden"
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 gap-1" 
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3 w-3" />
        <span className="hidden sm:inline">Importar</span>
      </Button>
    </div>
  )
}
