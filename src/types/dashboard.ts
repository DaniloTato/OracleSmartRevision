export interface KpiSummary {
   totalTasks: number
}

export interface TasksByUser {
   user: string
   tasksCompleted: number
}

export interface HoursByUser {
   userId: number
   actualHours: number
}

export interface TasksPerSprint {
   sprint: string
   [userName: string]: number | string
}
