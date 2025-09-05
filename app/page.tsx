"use client"

import { useState, useEffect } from "react"
import ShaderBackground from "@/components/shader-background"

interface Trade {
  tx: string
  amount: number
  priceUsd: number
  volume: number
  volumeSol: number
  type: "buy" | "sell"
  wallet: string
  time: number
  program: string
  pools: string[]
}

interface TradeResponse {
  trades: Trade[]
}

interface Holder {
  wallet: string
  amount: number
  value: {
    quote: number
    usd: number
  }
  percentage: number
}

interface HoldersResponse {
  total: number
  accounts: Holder[]
}

interface FeesResponse {
  totalFees: string
  totalFeesSOL: string
}

interface TokenResponse {
  token: {
    creation: {
      created_time: number
    }
  }
}

export default function ShaderShowcase() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [holders, setHolders] = useState<Holder[]>([])
  const [timeLeft, setTimeLeft] = useState<string>("10:00")
  const [fees, setFees] = useState<number>(2.08)
  const [tokenCreationTime, setTokenCreationTime] = useState<number | null>(null)
  const tokenAddress = "6n5sKMjcE39nMqYKrbAB7NtjxNr9Kyteruyx7B3Bpump" // Using the CA from above

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const response = await fetch(`https://data.solanatracker.io/tokens/${tokenAddress}`, {
          headers: {
            "x-api-key": "2cfcad28-bdc9-481b-87cd-6e2c5340db81",
          },
        })

        if (response.ok) {
          const data: TokenResponse = await response.json()
          setTokenCreationTime(data.token.creation.created_time * 1000) // Convert to milliseconds
        }
      } catch (error) {
        console.error("Failed to fetch token info:", error)
      }
    }

    const fetchTrades = async () => {
      try {
        const response = await fetch(`https://data.solanatracker.io/trades/${tokenAddress}`, {
          headers: {
            "x-api-key": "2cfcad28-bdc9-481b-87cd-6e2c5340db81",
          },
        })

        if (!response.ok) {
          setTrades([])
          return
        }

        const data = await response.json()

        if (data && typeof data === "object" && "trades" in data && Array.isArray(data.trades)) {
          setTrades(data.trades.slice(0, 50))
        } else {
          setTrades([])
        }
      } catch (error) {
        console.error("Failed to fetch trades:", error)
        setTrades([])
      }
    }

    const fetchHolders = async () => {
      try {
        const response = await fetch(`https://data.solanatracker.io/tokens/${tokenAddress}/holders`, {
          headers: {
            "x-api-key": "2cfcad28-bdc9-481b-87cd-6e2c5340db81",
          },
        })

        if (!response.ok) {
          setHolders([])
          return
        }

        const data: HoldersResponse = await response.json()

        if (data && data.accounts && Array.isArray(data.accounts)) {
          // Exclude first value (liquidity pool) and take top 50
          setHolders(data.accounts.slice(1, 51))
        } else {
          setHolders([])
        }
      } catch (error) {
        console.error("Failed to fetch holders:", error)
        setHolders([])
      }
    }

    const fetchFees = async () => {
      try {
        const response = await fetch(`/api/fees?token=${tokenAddress}`)

        if (response.ok) {
          const data: FeesResponse = await response.json()
          const feesValue = Number.parseFloat(data.totalFeesSOL) * 13
          setFees(feesValue)
        } else {
          console.log("Fees API returned non-OK status:", response.status)
        }
      } catch (error) {
        console.log("Failed to fetch fees, using default value")
      }
    }

    // Initial fetch
    fetchTokenInfo()
    fetchTrades()
    fetchHolders()
    fetchFees()

    // Set up interval to refresh every 1 second
    const interval = setInterval(fetchTrades, 1000)
    const holdersInterval = setInterval(fetchHolders, 30000)
    const feesInterval = setInterval(fetchFees, 1000)

    const updateCountdown = () => {
      if (!tokenCreationTime) return

      const now = Date.now()
      const tenMinutes = 10 * 60 * 1000 // 10 minutes in milliseconds
      const endTime = tokenCreationTime + tenMinutes
      const remaining = Math.max(0, endTime - now)

      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)

      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }

    const countdownInterval = setInterval(updateCountdown, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(holdersInterval)
      clearInterval(feesInterval)
      clearInterval(countdownInterval)
    }
  }, [tokenAddress, tokenCreationTime])

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`
    }
    return amount.toFixed(0)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 3)}...${wallet.slice(-3)}`
  }

  return (
    <div className="relative min-h-screen">
      <ShaderBackground />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6 max-w-6xl w-full">
          <div className="mb-4 -mt-16">
            <img src="/logo.png" alt="Hodlcoin Logo" className="w-36 h-36 object-contain" />
          </div>

          <div className="flex items-center gap-3 font-sora leading-3 text-center mb-0">
            <div className="text-white/80 text-sm">CA: 6n5sKMjcE39nMqYKrbAB7NtjxNr9Kyteruyx7B3Bpump</div>
            <div className="flex gap-2">
              <a
                href="https://oxr.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white transition-colors font-sora text-sm leading-4"
              >
                Axiom
              </a>
              <a
                href="https://oxr.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white transition-colors font-sora text-sm leading-4"
              >
                Padre
              </a>
              <a
                href="https://oxr.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white transition-colors font-sora text-sm leading-4"
              >
                Nova
              </a>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex-1 h-[270px] bg-white/5 border-[1.5px] border-white/40 rounded-lg backdrop-blur-md p-4 flex flex-col">
              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">Countdown</h3>
                <hr className="border-white/30 mt-2" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-4xl font-bold font-sora">{timeLeft}</div>
                </div>
              </div>
              <div className="flex justify-center">
                <a
                  href={`https://solscan.io/account/${tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white transition-colors font-sora text-sm"
                >
                  View on Solscan
                </a>
              </div>
            </div>

            <div className="flex-1 h-[270px] bg-white/5 border-[1.5px] border-white/40 rounded-lg backdrop-blur-md p-4">
              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">Fees</h3>
                <hr className="border-white/30 mt-2" />
              </div>
              <div className="flex items-center justify-center leading-[0rem] h-8/12">
                <div className="text-center">
                  <span className="text-white text-4xl font-bold font-sora">{fees.toFixed(2)}</span>
                  <span className="text-white/80 text-xl font-sora ml-1">SOL</span>
                </div>
              </div>
            </div>

            <div className="flex-1 h-[270px] bg-white/5 border-[1.5px] border-white/40 rounded-lg backdrop-blur-md p-4">
              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">Hodlcoin</h3>
                <hr className="border-white/30 mt-2" />
              </div>
              <div className="text-white/90 text-sm space-y-3">
                <p>
                  For every trade placed on $HODL, 0.3% of the amount goes towards the creator. Every minute, we will
                  redistribute the creator fees accordingly to the amount of tokens you are holding.
                </p>
                <div className="bg-white/10 rounded p-3 mt-4 font-inter">
                  <p className="text-white text-xs">Holder's Fee % = (Holder's Tokens / Total Top 50 Supply) × 100</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 w-full">
            <div className="flex-1 h-80 bg-white/5 border-[1.5px] border-white/40 rounded-lg backdrop-blur-md p-4">
              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">Top Holders</h3>
                <hr className="border-white/30 mt-2" />
              </div>
              <div className="overflow-y-auto h-64 custom-scrollbar">
                <div className="text-xs text-white/60 grid grid-cols-4 gap-2 mb-2 font-sora">
                  <span>Rank</span>
                  <span>Amount</span>
                  <span>Percent</span>
                  <span>Wallet</span>
                </div>
                {holders.length > 0 ? (
                  holders.map((holder, index) => (
                    <div
                      key={holder.wallet}
                      className="text-xs grid grid-cols-4 gap-2 py-1 border-b border-white/10 font-sora"
                    >
                      <span className="text-white/80">#{index + 1}</span>
                      <span className="text-white/80">{formatAmount(holder.amount)}</span>
                      <span className="text-white/80">{holder.percentage.toFixed(2)}%</span>
                      <a
                        href={`https://solscan.io/account/${holder.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {formatWallet(holder.wallet)}
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-xs">Loading holders...</div>
                )}
              </div>
            </div>

            <div className="flex-1 h-80 bg-white/5 border-[1.5px] border-white/40 rounded-lg backdrop-blur-md p-4">
              <div className="mb-3">
                <h3 className="text-white font-semibold text-lg">Trade Feed</h3>
                <hr className="border-white/30 mt-2" />
              </div>
              <div className="overflow-y-auto h-64 custom-scrollbar">
                <div className="text-xs text-white/60 grid grid-cols-5 gap-2 mb-2 font-sora">
                  <span>Time</span>
                  <span>Type</span>
                  <span>Value</span>
                  <span>Wallet</span>
                  <span>Solscan</span>
                </div>
                {trades.length > 0 ? (
                  trades.map((trade, index) => (
                    <div
                      key={`${trade.tx}-${index}`}
                      className="text-xs grid grid-cols-5 gap-2 py-1 border-b border-white/10 font-sora"
                    >
                      <span className="text-white/80">{formatTime(trade.time)}</span>
                      <span className={trade.type === "buy" ? "text-green-400" : "text-red-400"}>
                        {trade.type === "buy" ? "Buy" : "Sell"}
                      </span>
                      <span className="text-white/80">${trade.volume.toFixed(2)}</span>
                      <a
                        href={`https://solscan.io/account/${trade.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {formatWallet(trade.wallet)}
                      </a>
                      <a
                        href={`https://solscan.io/tx/${trade.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        ↗
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-xs">Loading trades...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
