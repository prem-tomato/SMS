export interface Notice {
  id: string
  title: string
  created_at: string
  status: string
}

export interface SocietyBreakdown {
  id: string
  name: string
  total_buildings: number
  total_flats: number
  total_members: number
}

export interface Member {
  id: string
  first_name: string
  last_name: string
  phone: string
}

export interface DashboardData {
  total_societies: number
  total_buildings: number
  total_flats: number
  occupied_flats: number
  total_members: number
  recent_notices: Notice[]
  societies_breakdown: SocietyBreakdown[]
  members_list: Member[]
  all_notices: Notice[]
}

export interface FinalBalanceData {
  society_name: string
  society_balance: number
  total_expense: number
  total_maintenance: number
  final_balance: number
  raw_maintenance_amount: number
  total_penalties: number
}

export interface SocietySpecificData {
  total_buildings: number
  total_flats: number
  occupied_flats: number
  total_members: number
  recent_notices: Notice[]
  members_list: Member[]
  final_balance: FinalBalanceData | null
}
