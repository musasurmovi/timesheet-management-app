import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

type Timesheet = { id: string; week: number; date: string; status: string; notes?: string }

const DATA_PATH = path.join(process.cwd(), 'data', 'timesheets.json')

async function readDB(): Promise<Timesheet[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(raw) as Timesheet[]
  } catch (err) {
    return []
  }
}

async function writeDB(data: Timesheet[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await readDB()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const items = await readDB()
  const newItem: Timesheet = {
    id: String(Date.now()),
    week: Number(body.week) || 0,
    date: body.date || '',
    status: body.status || 'Draft',
    notes: body.notes || ''
  }
  items.unshift(newItem)
  await writeDB(items)
  return NextResponse.json(newItem, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const items = await readDB()
  const idx = items.findIndex((i) => i.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  items[idx] = { ...items[idx], ...body }
  await writeDB(items)
  return NextResponse.json(items[idx])
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  let items = await readDB()
  items = items.filter((i) => i.id !== id)
  await writeDB(items)
  return NextResponse.json({ success: true })
}
