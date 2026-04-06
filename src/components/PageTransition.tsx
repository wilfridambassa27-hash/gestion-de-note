'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.4 },
        scale: { duration: 0.5 }
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
