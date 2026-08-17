// Core domain types for IB4G BugTracker

export type BugStatus = "open" | "closed"
export type BugPriority = "low" | "medium" | "high" | "critical"
export type EnvironmentStage = "dev" | "staging" | "production"

export interface Label {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Bug {
  id: string
  jiraId: string | null
  summary: string
  overviewLoginCondition: string | null
  overviewPlatform: string | null
  overviewModule: string | null
  overviewTrigger: string | null
  overviewIssue: string | null
  envPage: string | null
  envPlatform: string | null
  envOS: string | null
  envBrowser: string | null
  preconditions: string[] // parsed from JSON
  stepsToReproduce: string[] // parsed from JSON
  actualResult: string | null
  expectedResult: string | null
  userImpact: string | null
  businessImpact: string | null
  qaImpact: string | null
  technicalNotes: string | null
  environmentStage: EnvironmentStage
  status: BugStatus
  priority: BugPriority
  assignee: string | null
  reporter: string
  createdAt: string
  updatedAt: string
  labels: Label[]
}

export interface BugFilters {
  search?: string
  status?: BugStatus | "all"
  priority?: BugPriority | "all"
  platform?: string | "all"
  stage?: EnvironmentStage | "all"
  assignee?: string
  labelId?: string
  page?: number
  pageSize?: number
}

export interface BugListResponse {
  data: Bug[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BugStats {
  total: number
  open: number
  closed: number
  critical: number
  byStatus: { name: string; value: number; fill: string }[]
  byPriority: { name: string; value: number; fill: string }[]
  byStage: { name: string; value: number; fill: string }[]
  byPlatform: { name: string; value: number }[]
  recent: Bug[]
}

// Input shape for creating/updating a bug
export interface BugInput {
  jiraId?: string | null
  summary: string
  overviewLoginCondition?: string | null
  overviewPlatform?: string | null
  overviewModule?: string | null
  overviewTrigger?: string | null
  overviewIssue?: string | null
  envPage?: string | null
  envPlatform?: string | null
  envOS?: string | null
  envBrowser?: string | null
  preconditions?: string[]
  stepsToReproduce?: string[]
  actualResult?: string | null
  expectedResult?: string | null
  userImpact?: string | null
  businessImpact?: string | null
  qaImpact?: string | null
  technicalNotes?: string | null
  environmentStage?: EnvironmentStage
  status?: BugStatus
  priority?: BugPriority
  assignee?: string | null
  reporter?: string
  labelIds?: string[]
}

// Result of parsing a Jira template
export interface ParsedOverview {
  jiraId: string | null
  summary: string
  overviewLoginCondition: string | null
  overviewPlatform: string | null
  overviewModule: string | null
  overviewTrigger: string | null
  overviewIssue: string | null
  envPage: string | null
  envPlatform: string | null
  envOS: string | null
  envBrowser: string | null
  preconditions: string[]
  stepsToReproduce: string[]
  actualResult: string | null
  expectedResult: string | null
  userImpact: string | null
  businessImpact: string | null
  qaImpact: string | null
  technicalNotes: string | null
}

export interface ApiInfo {
  name: string
  version: string
  framework: string
  database: string
  orm: string
  template: string
  endpoints: EndpointInfo[]
  envVars: EnvVarInfo[]
}

export interface EndpointInfo {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
}

export interface EnvVarInfo {
  name: string
  description: string
  required: boolean
}
