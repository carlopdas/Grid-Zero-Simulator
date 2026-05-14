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
import { Save, FolderOpen, Trash2, ChevronDown, Plus, FileText } from "lucide-react"
import { toast } from "sonner"

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
    </div>
  )
}
