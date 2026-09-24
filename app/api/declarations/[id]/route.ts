import { NextResponse } from "next/server"
import { deleteDeclaration, findDeclaration, updateDeclaration } from "../store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = findDeclaration(id)
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const item = updateDeclaration(id, body)
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = deleteDeclaration(id)
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
