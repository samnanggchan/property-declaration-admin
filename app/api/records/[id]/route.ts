import { NextResponse } from "next/server"
import { deleteRecord, findRecord, updateRecord } from "../store"

type Context = { params: Promise<{ id: string }> }

export async function GET(_: Request, context: Context) {
  const record = findRecord((await context.params).id)
  return record ? NextResponse.json(record) : NextResponse.json({ message: "Record not found" }, { status: 404 })
}

export async function PATCH(request: Request, context: Context) {
  const record = updateRecord((await context.params).id, await request.json())
  return record ? NextResponse.json(record) : NextResponse.json({ message: "Record not found" }, { status: 404 })
}

export async function DELETE(_: Request, context: Context) {
  return deleteRecord((await context.params).id) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ message: "Record not found" }, { status: 404 })
}