"use client"

import { motion } from "framer-motion"

interface DoodleProps {
  type: "arrow" | "squiggle" | "star" | "circle"
  className?: string
}

export function Doodle({ type, className }: DoodleProps) {
  const doodles = {
    arrow: (
      <motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className={className}
      >
        <motion.path
          d="M20 50 Q50 50 70 30 L90 10 M90 10 L70 20 M90 10 L80 30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    ),
    squiggle: (
      <motion.svg
        width="200"
        height="20"
        viewBox="0 0 200 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <motion.path
          d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.svg>
    ),
    star: (
      <motion.svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        initial={{ scale: 0.5, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <path d="M15 0L18.5 11H30L20.5 17.5L24 28.5L15 22L6 28.5L9.5 17.5L0 11H11.5L15 0Z" fill="currentColor" />
      </motion.svg>
    ),
    circle: (
      <motion.svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        initial={{ scale: 0.8, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
      </motion.svg>
    ),
  }

  return doodles[type]
}

