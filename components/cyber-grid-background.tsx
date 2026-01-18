"use client"

import { useEffect, useRef } from "react"

export function CyberGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Particles for floating effect
    const particles: Array<{
      x: number
      y: number
      z: number
      speed: number
      size: number
      brightness: number
    }> = []

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 1000,
        speed: 0.5 + Math.random() * 2,
        size: 1 + Math.random() * 3,
        brightness: 0.3 + Math.random() * 0.7,
      })
    }

    // Horizontal lines for the grid
    const gridLines = 20
    const verticalLines = 30

    const draw = () => {
      time += 0.01
      ctx.fillStyle = "#020617"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height * 0.65
      const horizon = canvas.height * 0.4
      const fov = 300

      // Draw radial gradient glow at horizon
      const gradient = ctx.createRadialGradient(centerX, horizon, 0, centerX, horizon, canvas.width * 0.8)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)")
      gradient.addColorStop(0.3, "rgba(139, 92, 246, 0.08)")
      gradient.addColorStop(0.6, "rgba(6, 182, 212, 0.04)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw perspective grid - horizontal lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 1

      for (let i = 0; i < gridLines; i++) {
        const progress = i / gridLines
        const z = 50 + progress * 1000 + ((time * 100) % (1000 / gridLines))
        const scale = fov / z
        const y = centerY - (centerY - horizon) * scale

        if (y > horizon - 10) {
          const alpha = Math.max(0, Math.min(1, (y - horizon) / (centerY - horizon)))
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + alpha * 0.4})`
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      }

      // Draw perspective grid - vertical lines
      for (let i = -verticalLines / 2; i <= verticalLines / 2; i++) {
        const xOffset = i * 80

        ctx.beginPath()
        ctx.strokeStyle = "rgba(139, 92, 246, 0.2)"

        // Draw line from horizon to bottom
        for (let j = 0; j <= 50; j++) {
          const progress = j / 50
          const z = 50 + progress * 1000
          const scale = fov / z
          const x = centerX + xOffset * scale * 3
          const y = centerY - (centerY - horizon) * scale

          if (j === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Draw glowing horizon line
      const horizonGradient = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 2)
      horizonGradient.addColorStop(0, "transparent")
      horizonGradient.addColorStop(0.5, "rgba(6, 182, 212, 0.8)")
      horizonGradient.addColorStop(1, "transparent")
      ctx.fillStyle = horizonGradient
      ctx.fillRect(0, horizon - 2, canvas.width, 4)

      // Draw glow below horizon line
      const belowHorizonGlow = ctx.createLinearGradient(0, horizon, 0, horizon + 100)
      belowHorizonGlow.addColorStop(0, "rgba(6, 182, 212, 0.3)")
      belowHorizonGlow.addColorStop(1, "transparent")
      ctx.fillStyle = belowHorizonGlow
      ctx.fillRect(0, horizon, canvas.width, 100)

      // Draw floating particles
      particles.forEach((particle) => {
        particle.z -= particle.speed
        if (particle.z <= 0) {
          particle.z = 1000
          particle.x = Math.random() * 2000 - 1000
          particle.y = Math.random() * 2000 - 1000
        }

        const scale = fov / particle.z
        const x = centerX + particle.x * scale
        const y = centerY - particle.y * scale

        if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
          const size = particle.size * scale * 2
          const alpha = particle.brightness * (1 - particle.z / 1000) * 0.8

          const colorIndex = Math.abs(Math.floor(particle.x + particle.y)) % 3
          const colorRGB = [
            [6, 182, 212], // cyan
            [59, 130, 246], // blue
            [139, 92, 246], // purple
          ][colorIndex]

          const color = `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, ${alpha})`

          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2)
          ctx.fill()

          // Glow effect - Using colorRGB array directly instead of .replace()
          if (size > 1) {
            const glowAlpha = alpha * 0.5
            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
            glow.addColorStop(0, `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, ${glowAlpha})`)
            glow.addColorStop(1, "transparent")
            ctx.fillStyle = glow
            ctx.beginPath()
            ctx.arc(x, y, size * 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // Draw scanning line effect
      const scanY = (Math.sin(time * 0.5) * 0.5 + 0.5) * (canvas.height - horizon) + horizon
      const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGradient.addColorStop(0, "transparent")
      scanGradient.addColorStop(0.5, "rgba(6, 182, 212, 0.1)")
      scanGradient.addColorStop(1, "transparent")
      ctx.fillStyle = scanGradient
      ctx.fillRect(0, scanY - 20, canvas.width, 40)

      // Draw corner accents
      const cornerSize = 100
      const cornerAlpha = 0.3

      // Top left
      ctx.strokeStyle = `rgba(6, 182, 212, ${cornerAlpha})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(20, 20 + cornerSize)
      ctx.lineTo(20, 20)
      ctx.lineTo(20 + cornerSize, 20)
      ctx.stroke()

      // Top right
      ctx.beginPath()
      ctx.moveTo(canvas.width - 20 - cornerSize, 20)
      ctx.lineTo(canvas.width - 20, 20)
      ctx.lineTo(canvas.width - 20, 20 + cornerSize)
      ctx.stroke()

      // Bottom left
      ctx.beginPath()
      ctx.moveTo(20, canvas.height - 20 - cornerSize)
      ctx.lineTo(20, canvas.height - 20)
      ctx.lineTo(20 + cornerSize, canvas.height - 20)
      ctx.stroke()

      // Bottom right
      ctx.beginPath()
      ctx.moveTo(canvas.width - 20 - cornerSize, canvas.height - 20)
      ctx.lineTo(canvas.width - 20, canvas.height - 20)
      ctx.lineTo(canvas.width - 20, canvas.height - 20 - cornerSize)
      ctx.stroke()

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
