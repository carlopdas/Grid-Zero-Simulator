"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
  duration = 2
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReduced(mediaQuery.matches)
  }, [])

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0
  })

  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`
  )

  useEffect(() => {
    if (isInView && !isReduced) {
      spring.set(value)
    } else if (isReduced) {
      spring.jump(value)
    }
  }, [isInView, spring, value, isReduced])

  if (isReduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    )
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
