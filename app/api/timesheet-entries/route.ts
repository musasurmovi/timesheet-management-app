import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'timesheet-entries.json')
const WEEKS_PATH = path.join(process.cwd(), 'data', 'weekly-timesheets.json')

async function readEntries() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

async function readWeeks() {
  try {
    const raw = await fs.readFile(WEEKS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

// Supports query: ?timesheetId=ts-1 or ?week=49
export async function GET(req: Request) {
  const url = new URL(req.url)
  const timesheetId = url.searchParams.get('timesheetId')
  const weekParam = url.searchParams.get('week')
  const entries = await readEntries()
  if (timesheetId) {
    return NextResponse.json(entries.filter((e: any) => e.timesheetId === timesheetId))
  }
  if (weekParam) {
    const weeks = await readWeeks()
    const week = Number(weekParam)
    const ids = weeks.filter((w: any) => w.week === week).map((w: any) => w.id)
    return NextResponse.json(entries.filter((e: any) => ids.includes(e.timesheetId)))
  }
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entries = await readEntries()
    const id = `e${Date.now()}`
    const created = { id, ...body }
    entries.push(created)
    await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2), 'utf8')
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const entries = await readEntries()
    const idx = entries.findIndex((e: any) => e.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    entries[idx] = { ...entries[idx], ...body }
    await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2), 'utf8')
    return NextResponse.json(entries[idx])
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const entries = await readEntries()
    const filtered = entries.filter((e: any) => e.id !== id)
    await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2), 'utf8')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
