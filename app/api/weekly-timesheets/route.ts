import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'weekly-timesheets.json')

async function readDB() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

async function writeDB(data: any) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error('Error writing to DB:', err)
    return false
  }
}

export async function GET() {
  const items = await readDB()
  return NextResponse.json(items)
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, totalHours } = body
    
    const items = await readDB()
    const index = items.findIndex((item: any) => item.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    items[index].totalHours = totalHours
    
    // Update status based on totalHours
    if (totalHours === 0) {
      items[index].status = 'Missing'
    } else if (totalHours >= 40) {
      items[index].status = 'Completed'
    } else {
      items[index].status = 'Incompleted'
    }
    
    await writeDB(items)
    return NextResponse.json(items[index])
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Error updating timesheet' }, { status: 500 })
  }
}
