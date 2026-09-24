export type PsdAxis = {
  code: string
  title: string
  purpose: string
  objectives: string[]
}

export type Kpi = {
  id: string
  code: string
  name: string
  value: number | null
  target: number | null
  unit: string
  axis: string
  status: "normal" | "warning" | "critical" | "pending"
}

export type Activity = {
  id: string
  title: string
  axis: string
  responsible: string
  status: "planned" | "progress" | "completed" | "blocked"
  progress: number
  deadline: string
}
