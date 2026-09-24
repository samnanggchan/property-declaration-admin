import { NextResponse } from "next/server"
import { createDeclaration, listDeclarations } from "./store"

export function GET() {
  return NextResponse.json(listDeclarations())
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(createDeclaration(body), { status: 201 })
  } catch {
    return NextResponse.json(createDeclaration(), { status: 201 })
  }
}
