"use client"

import type React from "react"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyPassword } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { CyberGridBackground } from "./cyber-grid-background"

export function PasswordForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await verifyPassword(password)

    if (result.success) {
      router.refresh()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <CyberGridBackground />
      <div className="max-w-md w-full relative z-10">
        <div className="p-8 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
              <Eye className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Protected Content</h1>
            <p className="text-white/60">Enter the password to view this pitch deck</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-400"
                autoFocus
                disabled={isLoading}
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "View"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
