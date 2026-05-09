"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SimulationResults } from "@/lib/grid-zero-types"
import { 
  Lightbulb, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Battery,
  Sun,
  Zap
} from "lucide-react"

interface InsightsPanelProps {
  results: SimulationResults
  batteryEnabled: boolean
}

interface ConceptCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

function ConceptCard({ title, description, icon }: ConceptCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export function InsightsPanel({ results, batteryEnabled }: InsightsPanelProps) {
  const insights: { type: 'success' | 'warning' | 'info'; title: string; description: string }[] = []

  // Generate automatic insights based on results
  if (results.curtailedPercent > 30) {
    insights.push({
      type: 'warning',
      title: 'Alta Taxa de Curtailment',
      description: `${results.curtailedPercent.toFixed(1)}% da geração está sendo desperdiçada. Considere a inclusão de baterias ou aumento da carga diurna para melhor aproveitamento.`
    })
  }

  if (results.selfConsumptionPercent < 50) {
    insights.push({
      type: 'warning',
      title: 'Baixo Autoconsumo',
      description: `Apenas ${results.selfConsumptionPercent.toFixed(1)}% da geração está sendo consumida localmente. Isso indica desalinhamento temporal entre geração e demanda.`
    })
  }

  if (results.energyIndependence > 80) {
    insights.push({
      type: 'success',
      title: 'Alta Independência Energética',
      description: `O sistema atinge ${results.energyIndependence.toFixed(1)}% de independência da rede, demonstrando excelente dimensionamento.`
    })
  }

  if (batteryEnabled && results.storedEnergy > 0) {
    const batteryEfficiency = (results.dischargedEnergy / results.storedEnergy) * 100
    if (batteryEfficiency > 70) {
      insights.push({
        type: 'success',
        title: 'Bateria Bem Utilizada',
        description: `${batteryEfficiency.toFixed(1)}% da energia armazenada foi efetivamente utilizada, indicando bom dimensionamento do sistema de armazenamento.`
      })
    }
  }

  if (!batteryEnabled && results.curtailedPercent > 15) {
    insights.push({
      type: 'info',
      title: 'Potencial para Baterias',
      description: `Com ${results.curtailedEnergy.toFixed(1)} kWh de energia curtailed, a instalação de baterias poderia aumentar significativamente o aproveitamento solar.`
    })
  }

  if (results.generatorEnergy > results.totalConsumed * 0.1) {
    insights.push({
      type: 'warning',
      title: 'Uso Significativo do Gerador',
      description: `O gerador está suprindo ${((results.generatorEnergy / results.totalConsumed) * 100).toFixed(1)}% da demanda. Considere aumentar a capacidade FV ou de armazenamento.`
    })
  }

  return (
    <div className="space-y-6">
      {/* Concept Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ConceptCard
          title="Grid Zero"
          description="Operação onde a exportação de energia para rede é mantida em zero por controle dinâmico do inversor, garantindo conformidade regulatória."
          icon={<Zap className="h-5 w-5 text-primary" />}
        />
        <ConceptCard
          title="Curtailment"
          description="Energia solar disponível porém não utilizada devido a restrições operacionais do modo Grid Zero quando geração excede demanda."
          icon={<AlertTriangle className="h-5 w-5 text-solar" />}
        />
        <ConceptCard
          title="Autoconsumo"
          description="Percentual da geração fotovoltaica efetivamente utilizada localmente para suprir a carga instantânea."
          icon={<Sun className="h-5 w-5 text-solar" />}
        />
        <ConceptCard
          title="Independência Energética"
          description="Percentual da carga total atendida por geração local, armazenamento e backup, sem necessidade da rede."
          icon={<Battery className="h-5 w-5 text-battery" />}
        />
      </div>

      {/* Dynamic Insights */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-accent" />
            Observações Automáticas
          </CardTitle>
          <CardDescription>
            Análises baseadas nos resultados da simulação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sistema Balanceado</AlertTitle>
              <AlertDescription>
                O sistema está operando com parâmetros adequados. Execute a simulação para gerar insights específicos.
              </AlertDescription>
            </Alert>
          ) : (
            insights.map((insight, index) => (
              <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
                {insight.type === 'success' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {insight.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {insight.type === 'info' && <TrendingUp className="h-4 w-4 text-accent" />}
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* Technical Notes */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            Notas Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Estratégia de Bateria:</strong> Armazenar excedente solar durante períodos de alta geração e descarregar durante déficits, sempre respeitando limites de SOC configurados.
          </p>
          <p>
            <strong className="text-foreground">Lógica do Gerador:</strong> Acionado automaticamente quando geração FV + descarga de bateria são insuficientes para atender a carga.
          </p>
          <p>
            <strong className="text-foreground">Garantia Grid Zero:</strong> A exportação para rede é sempre zero - qualquer excedente que não pode ser armazenado é curtailed (desperdiçado).
          </p>
          <p>
            <strong className="text-foreground">Window Clipping:</strong> Limitação percentual aplicada à geração máxima do inversor, simulando restrições operacionais ou despacho controlado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
