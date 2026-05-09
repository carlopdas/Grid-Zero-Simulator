"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SimulationResults } from "@/lib/grid-zero-types"
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Battery, 
  Fuel, 
  Shield,
  ArrowDown,
  ArrowUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardsProps {
  results: SimulationResults
  batteryEnabled: boolean
  generatorEnabled: boolean
}

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function KPICard({ title, value, subtitle, icon, trend, variant = 'default' }: KPICardProps) {
  const variants = {
    default: 'bg-card/50',
    success: 'bg-primary/5 border-primary/20',
    warning: 'bg-accent/5 border-accent/20',
    danger: 'bg-destructive/5 border-destructive/20'
  }

  return (
    <Card className={cn("border-border/50 backdrop-blur transition-all hover:shadow-lg", variants[variant])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {value}
            </p>
            {subtitle && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {trend === 'up' && <ArrowUp className="h-3 w-3 text-primary" />}
                {trend === 'down' && <ArrowDown className="h-3 w-3 text-destructive" />}
                {subtitle}
              </div>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-2",
            variant === 'success' && "bg-primary/10 text-primary",
            variant === 'warning' && "bg-accent/10 text-accent",
            variant === 'danger' && "bg-destructive/10 text-destructive",
            variant === 'default' && "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KPICards({ results, batteryEnabled, generatorEnabled }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <KPICard
        title="Energia Gerada"
        value={`${results.totalGenerated.toFixed(1)} kWh`}
        subtitle="Total diário"
        icon={<Sun className="h-5 w-5" />}
        variant="warning"
      />
      <KPICard
        title="Energia Consumida"
        value={`${results.totalConsumed.toFixed(1)} kWh`}
        subtitle="Demanda total"
        icon={<Zap className="h-5 w-5" />}
        variant="default"
      />
      <KPICard
        title="Autoconsumo"
        value={`${results.selfConsumptionPercent.toFixed(1)}%`}
        subtitle={`${results.selfConsumption.toFixed(1)} kWh aproveitados`}
        icon={<TrendingUp className="h-5 w-5" />}
        variant="success"
        trend={results.selfConsumptionPercent > 70 ? 'up' : 'down'}
      />
      <KPICard
        title="Curtailed Energy"
        value={`${results.curtailedEnergy.toFixed(1)} kWh`}
        subtitle={`${results.curtailedPercent.toFixed(1)}% da geração`}
        icon={<AlertTriangle className="h-5 w-5" />}
        variant={results.curtailedPercent > 20 ? 'danger' : 'warning'}
        trend={results.curtailedPercent > 20 ? 'down' : 'neutral'}
      />
      <KPICard
        title="Independência"
        value={`${results.energyIndependence.toFixed(1)}%`}
        subtitle="Energia local"
        icon={<Shield className="h-5 w-5" />}
        variant="success"
        trend={results.energyIndependence > 80 ? 'up' : 'neutral'}
      />
      {batteryEnabled && (
        <>
          <KPICard
            title="Energia Armazenada"
            value={`${results.storedEnergy.toFixed(1)} kWh`}
            subtitle="Carregada na bateria"
            icon={<Battery className="h-5 w-5" />}
            variant="default"
          />
          <KPICard
            title="Energia Descarregada"
            value={`${results.dischargedEnergy.toFixed(1)} kWh`}
            subtitle="Utilizada da bateria"
            icon={<Battery className="h-5 w-5" />}
            variant="success"
          />
        </>
      )}
      {generatorEnabled && (
        <KPICard
          title="Energia Gerador"
          value={`${results.generatorEnergy.toFixed(1)} kWh`}
          subtitle="Backup utilizado"
          icon={<Fuel className="h-5 w-5" />}
          variant={results.generatorEnergy > 0 ? 'warning' : 'default'}
        />
      )}
    </div>
  )
}
