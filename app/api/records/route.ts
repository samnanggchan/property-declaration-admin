import { NextResponse } from "next/server"
import { createRecord, listRecords } from "./store"

export function GET() { return NextResponse.json(listRecords()) }
export function POST() { return NextResponse.json(createRecord(), { status: 201 }) }