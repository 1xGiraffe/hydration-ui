import {
  LazyMotion,
  domAnimation,
  m as motion,
  useAnimation,
  useReducedMotion,
} from "framer-motion"
import React, { useEffect, useRef } from "react"
import { SContainer, SContainerMobile } from "./MemepadVisual.styled"

import bottlecap1a from "assets/images/bottlecap1a.webp"
import bottlecap2a from "assets/images/bottlecap2a.webp"
import bottlecap3a from "assets/images/bottlecap3a.webp"

import bottlecap1b from "assets/images/bottlecap1b.webp"
import bottlecap2b from "assets/images/bottlecap2b.webp"
import bottlecap3b from "assets/images/bottlecap3b.webp"

import bottlecapsMobile from "assets/images/bottlecaps-mobile.webp"

type MemepadVisualProps = {
  variant: "a" | "b"
  className?: string
  animmated?: boolean
}

export const MemepadVisual: React.FC<MemepadVisualProps> = ({
  className,
  variant,
  animmated = false,
}) => {
  const animationRef = useRef<number>()
  const shouldReduceMotion = useReducedMotion()

  const animation1 = useAnimation()
  const animation2 = useAnimation()
  const animation3 = useAnimation()

  const shouldAnimate = animmated && !shouldReduceMotion

  useEffect(() => {
    const update = (e: MouseEvent) => {
      const clientX = e.x
      const clientY = e.y

      const moveX = clientX - window.innerWidth / 2
      const moveY = clientY - window.innerHeight / 2
      const offseFactor1 = 100
      const offseFactor2 = 130
      const offseFactor3 = 600

      animationRef.current = window.requestAnimationFrame(() => {
        animation1.start({
          x: (moveX / offseFactor1) * -1,
          y: (moveY / offseFactor1) * -1,
          rotateY: moveY * 0.0025,
          rotateX: moveX * 0.0025,
          rotateZ: (moveX + moveY) * 0.0025,
        })
        animation2.start({
          x: moveX / offseFactor2,
          y: moveY / offseFactor2,
          rotateZ: (moveX + moveY) * 0.005,
        })
        animation3.start({
          x: (moveX / offseFactor3) * -1,
          y: (moveY / offseFactor3) * -1,
          rotateZ: (moveX + moveY) * -0.005,
        })
      })
    }

    if (shouldAnimate) {
      window.addEventListener("mousemove", update)
      return () => {
        window.removeEventListener("mousemove", update)
        animationRef.current &&
          window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animation1, animation2, animation3, shouldAnimate])

  return (
    <LazyMotion features={domAnimation}>
      <SContainer className={className} as={motion.div} variant={variant}>
        <motion.div animate={animation3}>
          <img
            loading="lazy"
            src={variant === "a" ? bottlecap3a : bottlecap3b}
            alt=""
            width={150}
            height={150}
          />
        </motion.div>
        <motion.div animate={animation2}>
          <img
            loading="lazy"
            src={variant === "a" ? bottlecap2a : bottlecap2b}
            alt=""
            width={175}
            height={175}
          />
        </motion.div>
        <motion.div animate={animation1}>
          <img
            loading="lazy"
            src={variant === "a" ? bottlecap1a : bottlecap1b}
            alt=""
            width={250}
            height={250}
          />
        </motion.div>
      </SContainer>
    </LazyMotion>
  )
}

export type MemepadVisualMobileProps = {
  className?: string
}

export const MemepadVisualMobile: React.FC<MemepadVisualMobileProps> = ({
  className,
}) => {
  return (
    <SContainerMobile className={className}>
      <img loading="lazy" src={bottlecapsMobile} alt="" />
    </SContainerMobile>
  )
}