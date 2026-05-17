declare module 'framer-motion' {
  import { ComponentType, ReactNode, HTMLAttributes, CSSProperties } from 'react'

  export interface MotionProps {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
    whileHover?: any
    whileTap?: any
    whileInView?: any
    variants?: any
    layout?: boolean | 'position' | 'size'
    layoutId?: string
    style?: CSSProperties
    className?: string
    onClick?: (e: React.MouseEvent) => void
    onMouseEnter?: (e: React.MouseEvent) => void
    onMouseLeave?: (e: React.MouseEvent) => void
    onKeyDown?: (e: React.KeyboardEvent) => void
    ref?: any
    key?: string | number
    children?: ReactNode
    id?: string
    disabled?: boolean
  }

  type MotionDiv = ComponentType<MotionProps & HTMLAttributes<HTMLDivElement>>
  type MotionButton = ComponentType<MotionProps & HTMLAttributes<HTMLButtonElement>>
  type MotionSpan = ComponentType<MotionProps & HTMLAttributes<HTMLSpanElement>>
  type MotionP = ComponentType<MotionProps & HTMLAttributes<HTMLParagraphElement>>
  type MotionH1 = ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>
  type MotionH2 = ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>
  type MotionSection = ComponentType<MotionProps & HTMLAttributes<HTMLElement>>
  type MotionAside = ComponentType<MotionProps & HTMLAttributes<HTMLElement>>
  type MotionHeader = ComponentType<MotionProps & HTMLAttributes<HTMLElement>>

  export const motion: {
    div: MotionDiv
    button: MotionButton
    span: MotionSpan
    p: MotionP
    h1: MotionH1
    h2: MotionH2
    section: MotionSection
    aside: MotionAside
    header: MotionHeader
  }

  export const AnimatePresence: ComponentType<{
    children?: ReactNode
    mode?: 'wait' | 'sync' | 'popLayout'
    initial?: boolean
    onExitComplete?: () => void
  }>
}
