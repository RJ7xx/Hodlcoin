import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const response = await fetch(`https://swap-api.pump.fun/v1/creators/A9rcLxP9389Ru3xnUmRdTHwLpfCgaJ9pZipUMDphvsTK/fees/total`)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch fees" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Fees API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
