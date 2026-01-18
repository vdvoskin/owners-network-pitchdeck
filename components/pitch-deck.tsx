"use client"

import { useState, useEffect, useRef } from "react"
import {
  Target,
  Shield,
  Network,
  CheckCircle2,
  Zap,
  Lock,
  Users,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  XCircle,
  TrendingUp,
  Activity,
  Monitor,
} from "lucide-react"

import { CyberGridBackground } from "./cyber-grid-background"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 11
  const touchStartY = useRef(0)
  const lastScrollTime = useRef(0)
  const isMobile = useIsMobile()
  const [showMobileDialog, setShowMobileDialog] = useState(false)

  useEffect(() => {
    if (isMobile) {
      setShowMobileDialog(true)
    }
  }, [isMobile])

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  useEffect(() => {
    if (isMobile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        goToNextSlide()
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault()
        goToPrevSlide()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastScrollTime.current < 800) return

      if (e.deltaY > 30) {
        lastScrollTime.current = now
        goToNextSlide()
      } else if (e.deltaY < -30) {
        lastScrollTime.current = now
        goToPrevSlide()
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY.current - touchEndY
      const now = Date.now()

      if (now - lastScrollTime.current < 800) return

      if (diff > 50) {
        lastScrollTime.current = now
        goToNextSlide()
      } else if (diff < -50) {
        lastScrollTime.current = now
        goToPrevSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [currentSlide, isMobile])

  useEffect(() => {
    if (isMobile) return

    const slideElement = document.getElementById(`slide-${currentSlide}`)
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [currentSlide, isMobile])

  const NavigationButtons = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 z-50">
      <button
        onClick={goToPrevSlide}
        disabled={currentSlide === 0}
        className="w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronUp className="w-5 h-5 text-foreground" />
      </button>
      <span className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border shadow-lg">
        {currentSlide + 1} / {totalSlides}
      </span>
      <button
        onClick={goToNextSlide}
        disabled={currentSlide === totalSlides - 1}
        className="w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg"
        aria-label="Next slide"
      >
        <ChevronDown className="w-5 h-5 text-foreground" />
      </button>
    </div>
  )

  return (
    <div className={`min-h-screen bg-[#020617] relative ${isMobile ? "overflow-y-auto" : "overflow-hidden"}`}>
      <CyberGridBackground />

      <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
        <DialogContent className="bg-slate-900/95 border-cyan-500/30 text-white">
          <DialogHeader className="text-center items-center">
            <Monitor className="w-12 h-12 text-cyan-400 mb-2" />
            <DialogTitle className="text-white text-xl">Desktop Recommended</DialogTitle>
            <DialogDescription className="text-slate-300 text-base">
              For best viewing experience, please view from your desktop browser.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <NavigationButtons />

      {/* Slide 0: First Screen */}
      <section
        id="slide-0"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-10 md:py-20 relative overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-4 md:mb-8">
            <img src="/owners-network-logo-z.png" alt="Owners Network" className="w-64 md:w-96 h-auto mx-auto" />
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center mb-4 md:mb-8">
            {["Trustless", "On-chain", "Bridgeless"].map((feature, i) => (
              <div
                key={i}
                className="px-4 md:px-6 py-2 md:py-3 rounded-lg text-white font-medium text-base md:text-lg border border-cyan-400/50 bg-cyan-500/90 shadow-lg shadow-cyan-500/30"
              >
                {feature}
              </div>
            ))}
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl text-cyan-50/80 max-w-4xl mx-auto mb-6 md:mb-12 text-balance">
            A 100% trustless DEX with usability of a CEX
          </p>
        </div>
      </section>

      {/* Slide 1: The Problem */}
      <section
        id="slide-1"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">The Problem</h2>
            <p className="text-lg font-semibold text-cyan-400 mb-2">Unacceptable Trade-Off</p>
            <p className="text-lg text-cyan-100/70">
              Traders are forced to choose between CEX Risks and DEX Limitations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Lock,
                title: "Custodial Risks",
                stat: "~$50B lost",
                sublabel: "Fraud, hacks, frozen and/or confiscated user assets, government regulation, bankruptcy",
              },
              {
                icon: Shield,
                title: "Private Key Loss",
                stat: "~20% BTC unrecoverable",
                sublabel:
                  "Users lack tech-skills to secure keys, many avoid self-custody in favor of CEXs and ETFs due to discomfort of managing keys",
              },
              {
                icon: Users,
                title: "No Crypto Inheritance",
                stat: "Zero solutions",
                sublabel:
                  "Family wealth is trapped in wallets and cannot be passed-on without big hastle and huge security risk, all 3rd party solutions are unsecure",
              },
              {
                icon: Network,
                title: "Bridge & Wrapped Token Risks",
                stat: "~$3B stolen",
                sublabel:
                  "Bridges are notoriously exploitable, bridged wrapped assets are centralized and managed by 3rd party custodians",
              },
              {
                icon: Activity,
                title: "Bad UX & Performance",
                stat: "Slow & clunky",
                sublabel: "Sluggish order matching, AMMs lag behind market action, onramp is often a barrier",
              },
              {
                icon: EyeOff,
                title: "No User Privacy on CEXs",
                stat: "KYC a must",
                sublabel: "No anonymity and privacy, denial of service to certain citizens and geographies",
              },
            ].map((problem, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-red-500/30">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                  <problem.icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-bold mb-1 text-white">{problem.title}</h3>
                <div className="text-xl font-bold text-red-400">{problem.stat}</div>
                <div className="text-sm text-cyan-100/60">{problem.sublabel}</div>
              </div>
            ))}
          </div>
          {/*
          <div className="max-w-2xl mx-auto p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-red-500/20 text-center">
            <h3 className="text-xl font-bold mb-3 text-white">The Trade-Off</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="font-semibold text-white">CEX</p>
                <p className="text-sm text-cyan-100/60">Centralized control & risk</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="font-semibold text-white">DEX</p>
                <p className="text-sm text-cyan-100/60">Pseudo Trustlessness with limitations</p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Slide 2: The Solution */}
      <section
        id="slide-2"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">The Solution</h2>
            <p className="text-lg font-semibold text-cyan-400 mb-2">Bridgeless & Seamless</p>
            <p className="text-lg text-cyan-100/70 max-w-3xl mx-auto">
              100% trustless, bridgeless real-asset trading with CEX-grade speed
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Network,
                title: "Native Asset Trading",
                description: "Real BTC, ETH, XMR—no bridges, no wrapped coins",
              },
              {
                icon: Zap,
                title: "CEX-like UX",
                description: "On-chain order-book and instant order matching, built-in wallet for seamless on-ramp",
              },
              {
                icon: Activity,
                title: "Instant Execution",
                description: "Sub-one-second finality, reverse-gas model for zero-gas trading",
              },
              {
                icon: Shield,
                title: "Innovative Self-Custody",
                description: "Key recovery via iris scan, password, and sketch",
              },
              {
                icon: Users,
                title: "Trustless Crypto Inheritance",
                description: "Trivial policy setup and claim, all on-chain, without 3rd party involvement",
              },
              {
                icon: Sparkles,
                title: "Unique Edge",
                description: "100% trustless, bridgeless real-asset trading with CEX-grade speed",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-cyan-100/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 3: Product & Technology */}
      <section
        id="slide-3"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Product & Technology</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50">
              <h3 className="text-2xl font-bold mb-6 text-white">Product Offering (MVP)</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Native Spot Trading",
                    items: ["BTC, ETH, SOL, XMR", "Top 10 assets by market-cap"],
                  },
                  {
                    title: "Unified Self-Custody Wallet",
                    items: ["Private-key recovery", "Asset inheritance", "Multi-chain support"],
                  },
                ].map((product, i) => (
                  <div key={i} className="pb-4 border-b border-slate-700/50 last:border-0">
                    <h4 className="text-lg font-bold mb-2 text-cyan-400">{product.title}</h4>
                    <ul className="space-y-1">
                      {product.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-cyan-100/70">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30">
              <h3 className="text-2xl font-bold mb-6 text-white">Architecture Highlights</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "~1s Transaction Finality",
                    description: "On Vara.eth roll-up and Ethereum",
                  },
                  {
                    title: "On-chain Orderbook Engine",
                    description: "Sub-second matching",
                  },
                  {
                    title: "Hybrid L2/L1 Scalability",
                    description: "200K+ orders/sec processing capacity",
                  },
                  {
                    title: "Chain-signatures technology",
                    description: "Bridgeless cross-chain native asset management via smart-contracts",
                  },
                  {
                    title: "Reverse-Gas Model",
                    description: "Zero-gas user experience with zero-gas trading",
                  },
                ].map((arch, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-cyan-500/20">
                    <h4 className="text-base font-bold mb-1 text-white">{arch.title}</h4>
                    <p className="text-sm text-cyan-100/60">{arch.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: Market Opportunity */}
      <section
        id="slide-4"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Market Opportunity</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                value: "$898B",
                label: "Decentralized Perpetuals Volume",
                sublabel: "Q2 2025",
              },
              {
                value: "14M+",
                label: "DeFi User Base",
                sublabel: "Growing exponentially",
              },
              {
                value: "5%",
                label: "Target Market Share",
                sublabel: "On-Chain Derivatives by 2028",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30"
              >
                <div className="text-5xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-base font-semibold mb-1 text-white">{stat.label}</div>
                <div className="text-sm text-cyan-100/60">{stat.sublabel}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50">
              <h3 className="text-2xl font-bold mb-5 text-white">Our Target Goals</h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Top-10 DEX Position",
                    timeframe: "Within 2-3 years",
                  },
                  {
                    title: "5% of On-Chain Derivatives",
                    timeframe: "By 2028",
                  },
                ].map((goal, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
                  >
                    <Target className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold mb-1 text-white">{goal.title}</p>
                      <p className="text-sm text-cyan-100/60">{goal.timeframe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/20">
              <h3 className="text-2xl font-bold mb-5 text-white">User Migration Potential</h3>
              <div className="space-y-3">
                {[
                  "CEX users ready to migrate to better platforms",
                  "Growing demand for trustless, non-custodial solutions",
                  "Need for private key recovery and asset inheritance",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed text-cyan-100/80">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 5: Competitor Analysis */}
      <section
        id="slide-5"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Competitor Analysis</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            {[
              {
                name: "Binance (CEX)",
                strengths: ["Liquidity", "Performance",],
                weaknesses: ["3rd party custodian risks", "Not anonymous or private", "Heavily regulated"],
              },
              {
                name: "Hyperliquid (Hybrid DEX)",
                strengths: ["200K orders/sec", "~$110M monthly revenue"],
                weaknesses: ["Not trustless", "Limited decentralization"],
              },
              {
                name: "Uniswap (OG DEX)",
                strengths: ["Fully decentralized", "Large volume"],
                weaknesses: ["Wrapped tokens", "Lagging AMM prices", "Poor UX"],
              },
            ].map((competitor, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50">
                <h3 className="text-lg font-bold mb-3 text-white">{competitor.name}</h3>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-cyan-400 mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {competitor.strengths.map((strength, j) => (
                      <li key={j} className="text-sm text-cyan-100/70 flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-2">Weaknesses</p>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((weakness, j) => (
                      <li key={j} className="text-sm text-cyan-100/70 flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 text-center">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">Our Edge</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "100% trustless",
                "Bridgeless trading",
                "CEX-grade speed",
                "Key recovery",
                "Asset inheritance",
                "Unified wallet",
              ].map((edge, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/30 font-medium text-sm text-white"
                >
                  {edge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slide 6: Business Model & Projections */}
      <section
        id="slide-6"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Business Model & Projections</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-4 md:p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50 overflow-hidden">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Revenue Model</h3>
              <div className="space-y-4 md:space-y-5">
                <div className="p-3 md:p-5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-base md:text-lg font-bold mb-3 text-white">Transaction Fee</h4>
                  <div className="flex flex-wrap items-baseline gap-2 mb-3">
                    <span className="text-2xl md:text-3xl font-bold text-cyan-400">0.05%</span>
                    <span className="text-cyan-100/60">taker</span>
                    <span className="mx-1 md:mx-2 text-white">/</span>
                    <span className="text-xl md:text-2xl font-bold text-cyan-400">0.01%</span>
                    <span className="text-cyan-100/60">maker</span>
                  </div>
                </div>
                <div className="p-3 md:p-5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <h4 className="text-base md:text-lg font-bold mb-3 text-white">Hyperliquid Benchmark</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs md:text-sm text-cyan-100/60">Daily Volume</p>
                      <p className="text-lg md:text-xl font-bold text-white">$1B</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-cyan-100/60">Daily Revenue</p>
                      <p className="text-lg md:text-xl font-bold text-white">$500K</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-cyan-100/60">Monthly Revenue</p>
                      <p className="text-xl md:text-2xl font-bold text-cyan-400">$110M</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Revenue Projections</h3>
              <div className="space-y-4 md:space-y-5">
                <div className="p-3 md:p-5 rounded-lg bg-slate-800/50">
                  <p className="text-xs md:text-sm text-cyan-100/60 mb-2">Target</p>
                  <p className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">$50M</p>
                  <p className="text-sm md:text-base text-cyan-100/70">Annual revenue by Year 3</p>
                </div>
                <div className="p-3 md:p-5 rounded-lg bg-slate-800/50">
                  <p className="text-sm md:text-base font-semibold mb-3 text-white">Profitability</p>
                  <p className="text-sm md:text-base text-cyan-100/70 leading-relaxed">
                    Low costs on Vara.eth → more freedom for campaigns and customer acquisition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 7: Development Roadmap */}
      <section
        id="slide-7"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white">Development Roadmap</h2>
            <p className="text-lg text-cyan-100/70">8 Month Execution Plan</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                phase: "Foundation Phase",
                timeframe: "Months 1-2",
                items: ["Graphical design", "Dev-net setup", "Native assets layer"],
              },
              {
                phase: "Wallet Development",
                timeframe: "Months 3-4",
                items: ["Inheritance", "Wallet integration", "TradingView integration"],
              },
              {
                phase: "Trading & Launch Prep",
                timeframe: "Months 4-5",
                items: ["Key backup/recovery", "Spot trading", "Test-net launch"],
              },
              {
                phase: "Governance & Mainnet",
                timeframe: "Months 6-8",
                items: ["DAO structure", "Main-net launch", "Security audits"],
              },
            ].map((phase, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/20">
                <div className="text-sm font-semibold text-cyan-400 mb-2">{phase.timeframe}</div>
                <h3 className="text-lg font-bold mb-3 text-white">{phase.phase}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-cyan-100/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30">
            <h3 className="text-2xl font-bold mb-4 text-center text-white">Funding Ask: $600,000</h3>
            <p className="text-center text-cyan-100/60 mb-6">8-month runway</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { category: "Engineering & Security", percent: "60%" },
                { category: "Marketing & Community", percent: "30%" },
                { category: "Legal & Ops", percent: "5%" },
                { category: "Infrastructure", percent: "5%" },
              ].map((budget, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-cyan-500/30 text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{budget.percent}</div>
                  <p className="text-sm font-medium text-white">{budget.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slide 8: Long-Term Product Evolution */}
      <section
        id="slide-8"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative`}
      >
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Long-Term Product Evolution</h2>
            <p className="text-lg text-cyan-100/70">Building the future of trustless trading</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                version: "Version 2",
                items: ["Perpetual futures", "Mobile applications", "Web applications"],
              },
              {
                version: "Version 3",
                items: ["CEX-user campaign", "Options trading", "User bots"],
              },
              {
                version: "Version 4 (2027)",
                items: ["DaaS (DEX as a Service)", "White-label solution", "Liquidity sharing"],
              },
            ].map((phase, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30">
                <h3 className="text-2xl font-bold mb-5 text-cyan-400">{phase.version}</h3>
                <ul className="space-y-3">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed text-cyan-100/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 9: Team & Advisers */}
      <section
        id="slide-9"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative overflow-y-auto`}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Team & Advisers</h2>
          </div>
          <div className="flex flex-row justify-center gap-4 flex-wrap">
            {[
              {
                name: "Vadim Dvoskin",
                role: "Founder",
                imageSrc: "/team/vadim-dvoskin.png",
                background:
                  "Successful IT entrepreneur with 10+ years in software development, product management, and project management at Kaspersky Labs, General Electric, Acronis, and multiple crypto projects. Built DEXs, wallets, and smart contracts; full-time crypto user and active trader. Drives vision, product, and execution end-to-end. Big network of IT- professionals.",
              },
              {
                name: "Pavel Salas",
                role: "CBDO",
                imageSrc: "/team/pavel-salas.png",
                background:
                  "Seasoned executive with 15+ years of international experience across Fintech, Web3, and Regulated Finance. As a CGO of an L1 protocol, he has a proven track record in scaling Web3 ecosystems. Previously Executive Director for Russia & CIS at eToro, he leverages deep expertise in Trading across competitive markets like Lat Am, CIS, and Europe.",
              },
              {
                name: "Ivan Vakulenchik",
                role: "CTO",
                imageSrc: "/team/ivan-vakulenchik.png",
                background:
                  "Senior blockchain developer with 10+ years building smart contracts, wallets, DEX and DeFi protocols. Deep knowledge of Bitcoin and Ethereum, as well as experience with ICP, Eth-L2 chains, and Vara network. Expert knowledge in HFT systems and trading bots. Crypto enthusiast and trader.",
              },
              {
                name: "Alexandra Pollack",
                role: "CMO",
                imageSrc: "/team/alexandra-pollack.png",
                background:
                  "Proven marketing leader skilled in advanced technologies that enable personalized customer communication at scale. Currently drives marketing strategy at McDonald's Corporation; previously held key marketing roles at Deloitte. Columbia University (New York) graduate.",
              },
              {
                name: "Nick Volf",
                role: "Adviser",
                imageSrc: "/team/nick-volf.png",
                background:
                  "Founder of Vara Network and Senior software developer with deep expertise in Ethereum and Polkadot ecosystems. Former lead developer at Parity Technologies. Expert knowledge in building Substrate-based infrastructure and smart contract platforms. Well-connected across the global blockchain industry.",
              },
            ].map((member, i) => (
              <div
                key={i}
                className="flex-1 max-w-[200px] p-4 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-3 border-2 border-cyan-500">
                  <img
                    src={member.imageSrc || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold mb-1 text-center text-white">{member.name}</h3>
                <div className="text-cyan-400 font-medium mb-2 text-center text-xs">{member.role}</div>
                <p className="text-xs text-cyan-100/70 leading-relaxed text-left">{member.background}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 10: Join the Revolution */}
      <section
        id="slide-10"
        className={`${isMobile ? "min-h-screen" : "h-screen"} flex items-center justify-center px-6 py-12 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Join the Revolution</h2>
          <p className="text-xl text-cyan-100/70 mb-10 text-balance">Be part of the future of decentralized trading</p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Shield,
                title: "Trustless Infrastructure",
                description: "Forefront of decentralized trading technology",
              },
              {
                icon: Network,
                title: "Strategic Partnership",
                description: "Collaborate with industry leaders in DeFi",
              },
              {
                icon: TrendingUp,
                title: "Growth Opportunity",
                description: "Access $898B volume market",
              },
            ].map((benefit, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{benefit.title}</h3>
                <p className="text-sm text-cyan-100/70 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 mb-8">
            <h3 className="text-2xl font-bold mb-3 text-white">Ready to build the future?</h3>
            <img src="/telegram-qr.png" alt="Telegram QR Code" className="w-48 h-48 mx-auto" />
            <p className="text-lg text-cyan-100/70 mb-4">Contact us to discuss partnership opportunities</p>
          </div>
        </div>
      </section>
    </div>
  )
}
