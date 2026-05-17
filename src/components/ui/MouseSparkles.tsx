"use client";

import * as React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { Sparkles } from './Icons'

interface Point {
  x: number
  y: number
}

interface MouseSparklesProps {
  icon?: React.ReactNode
  starAnimationDuration?: number
  minimumTimeBetweenStars?: number
  minimumDistanceBetweenStars?: number
  glowDuration?: number
  maximumGlowPointSpacing?: number
  colors?: string[]
  sizes?: string[]
  className?: string
}

const defaultIcon = <Sparkles className="h-full w-full" />

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const MouseSparkles = React.forwardRef<HTMLDivElement, MouseSparklesProps>(
  (
    {
      icon = defaultIcon,
      starAnimationDuration = 1500,
      minimumTimeBetweenStars = 250,
      minimumDistanceBetweenStars = 75,
      glowDuration = 75,
      maximumGlowPointSpacing = 10,
      colors = ['229 194 137', '255 249 237', '127 209 255'],
      sizes = ['1.35rem', '1rem', '0.65rem'],
      className,
    },
    _ref,
  ) => {
    const configRef = React.useRef({
      starAnimationDuration,
      minimumTimeBetweenStars,
      minimumDistanceBetweenStars,
      glowDuration,
      maximumGlowPointSpacing,
      colors,
      sizes,
      animations: ['fall-1', 'fall-2', 'fall-3'],
    })

    const lastRef = React.useRef({
      starTimestamp: Date.now(),
      starPosition: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      starCount: 0,
    })

    const createStar = React.useCallback((position: Point) => {
      const wrapper = document.createElement('div')
      const color = selectRandom(configRef.current.colors)
      const size = selectRandom(configRef.current.sizes)
      const animationName = configRef.current.animations[lastRef.current.starCount++ % 3]

      wrapper.className = cn('mouse-sparkles-star', className)
      wrapper.style.left = `${position.x}px`
      wrapper.style.top = `${position.y}px`
      wrapper.style.fontSize = size
      wrapper.style.color = `rgb(${color})`
      wrapper.style.textShadow = `0 0 1.5rem rgb(${color} / 0.48)`
      wrapper.style.animationName = animationName
      wrapper.style.animationDuration = `${configRef.current.starAnimationDuration}ms`

      document.body.appendChild(wrapper)
      const root: Root = createRoot(wrapper)
      root.render(icon)

      window.setTimeout(() => {
        root.unmount()
        wrapper.remove()
      }, configRef.current.starAnimationDuration)
    }, [className, icon])

    const createGlowPoint = React.useCallback((position: Point) => {
      const glow = document.createElement('div')
      glow.className = cn('mouse-sparkles-glow-point', className)
      glow.style.left = `${position.x}px`
      glow.style.top = `${position.y}px`

      document.body.appendChild(glow)
      window.setTimeout(() => glow.remove(), configRef.current.glowDuration)
    }, [className])

    const createGlow = React.useCallback((last: Point, current: Point) => {
      const distance = calcDistance(last, current)
      const quantity = Math.max(Math.floor(distance / configRef.current.maximumGlowPointSpacing), 1)
      const dx = (current.x - last.x) / quantity
      const dy = (current.y - last.y) / quantity

      for (let index = 0; index < quantity; index += 1) {
        createGlowPoint({ x: last.x + dx * index, y: last.y + dy * index })
      }
    }, [createGlowPoint])

    const handleMove = React.useCallback((position: Point) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      if (lastRef.current.mousePosition.x === 0 && lastRef.current.mousePosition.y === 0) {
        lastRef.current.mousePosition = position
      }

      const now = Date.now()
      const hasMovedFarEnough =
        calcDistance(lastRef.current.starPosition, position) >= configRef.current.minimumDistanceBetweenStars
      const hasBeenLongEnough = now - lastRef.current.starTimestamp > configRef.current.minimumTimeBetweenStars

      if (hasMovedFarEnough || hasBeenLongEnough) {
        createStar(position)
        lastRef.current.starTimestamp = now
        lastRef.current.starPosition = position
      }

      createGlow(lastRef.current.mousePosition, position)
      lastRef.current.mousePosition = position
    }, [createGlow, createStar])

    React.useEffect(() => {
      const onMouseMove = (event: MouseEvent) => handleMove({ x: event.clientX, y: event.clientY })
      const onTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0]
        if (touch) handleMove({ x: touch.clientX, y: touch.clientY })
      }
      const onMouseLeave = () => {
        lastRef.current.mousePosition = { x: 0, y: 0 }
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: true })
      document.body.addEventListener('mouseleave', onMouseLeave)

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('touchmove', onTouchMove)
        document.body.removeEventListener('mouseleave', onMouseLeave)
      }
    }, [handleMove])

    return null
  },
)

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function selectRandom<T>(items: T[]): T {
  return items[rand(0, items.length - 1)]
}

export function calcDistance(a: Point, b: Point) {
  const diffX = b.x - a.x
  const diffY = b.y - a.y
  return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))
}

MouseSparkles.displayName = 'MouseSparkles'

export { MouseSparkles, MouseSparkles as Component }
