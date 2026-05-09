"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { SimulationResults } from "@/lib/grid-zero-types"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Battery, 
  Fuel, 
  Shield,
  ArrowDown,
  ArrowUp,
  PlugZap,
  BatteryCharging
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
  colorClass?: string
  bgClass?: string
}

function KPICard({ title, value, subtitle, icon, trend, colorClass = 'text-primary', bgClass = 'bg-primary/10' }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="glass-card border-0 transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <p className="gradient-value kpi-value text-2xl font-bold tracking-tight">
                {value}
              </p>
              {subtitle && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {trend === 'up' && <ArrowUp className="h-3 w-3 text-emerald-400" />}
                  {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-400" />}
                  {subtitle}
                </div>
              )}
            </div>
            <motion.div 
              className={cn("rounded-xl p-2.5", bgClass)}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className={colorClass}>{icon}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
        colorClass="text-solar"
        bgClass="bg-solar/10"
      />
      <KPICard
        title="Energia Consumida"
        value={`${results.totalConsumed.toFixed(1)} kWh`}
        subtitle="Demanda total"
        icon={<Zap className="h-5 w-5" />}
        colorClass="text-load"
        bgClass="bg-load/10"
      />
      <KPICard
        title="Autoconsumo"
        value={`${results.selfConsumptionPercent.toFixed(1)}%`}
        subtitle={`${results.selfConsumption.toFixed(1)} kWh aproveitados`}
        icon={<TrendingUp className="h-5 w-5" />}
        trend={results.selfConsumptionPercent > 70 ? 'up' : 'down'}
        colorClass="text-battery"
        bgClass="bg-battery/10"
      />
      <KPICard
        title="Energia Curtailed"
        value={`${results.curtailedEnergy.toFixed(1)} kWh`}
        subtitle={`${results.curtailedPercent.toFixed(1)}% da geração`}
        icon={<AlertTriangle className="h-5 w-5" />}
        trend={results.curtailedPercent > 20 ? 'down' : 'neutral'}
        colorClass="text-curtailed"
        bgClass="bg-curtailed/10"
      />
      <KPICard
        title="Independência"
        value={`${results.energyIndependence.toFixed(1)}%`}
        subtitle="Energia local"
        icon={<Shield className="h-5 w-5" />}
        trend={results.energyIndependence > 80 ? 'up' : 'neutral'}
        colorClass="text-primary"
        bgClass="bg-primary/10"
      />
      {batteryEnabled && (
        <>
          <KPICard
            title="Energia Armazenada"
            value={`${results.storedEnergy.toFixed(1)} kWh`}
            subtitle="Carregada na bateria"
            icon={<BatteryCharging className="h-5 w-5" />}
            colorClass="text-battery"
            bgClass="bg-battery/10"
          />
          <KPICard
            title="Energia Descarregada"
            value={`${results.dischargedEnergy.toFixed(1)} kWh`}
            subtitle="Utilizada da bateria"
            icon={<Battery className="h-5 w-5" />}
            colorClass="text-battery"
            bgClass="bg-battery/10"
          />
        </>
      )}
      {results.gridImport > 0 && (
        <KPICard
          title="Importação Rede"
          value={`${results.gridImport.toFixed(1)} kWh`}
          subtitle="Energia da concessionária"
          icon={<PlugZap className="h-5 w-5" />}
          colorClass="text-muted-foreground"
          bgClass="bg-muted"
        />
      )}
      {generatorEnabled && results.generatorEnergy > 0 && (
        <KPICard
          title="Energia Gerador"
          value={`${results.generatorEnergy.toFixed(1)} kWh`}
          subtitle="Backup utilizado"
          icon={<Fuel className="h-5 w-5" />}
          colorClass="text-generator"
          bgClass="bg-generator/10"
        />
      )}
    </div>
  )
}
