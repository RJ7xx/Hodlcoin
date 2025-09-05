"use client"

import type React from "react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "#0a1a0f",
        backgroundImage: `radial-gradient(circle, #2f3d33 1px, transparent 1px)`,
        backgroundSize: "12px 12px",
      }}
    >
      {children}
    </div>
  )
}
