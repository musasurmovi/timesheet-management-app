export type Timesheet = {
  id: string
  week: number
  date: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  notes?: string
}
