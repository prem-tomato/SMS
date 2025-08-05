export interface Notice {
  id: string
  title: string
  created_at: string
  status: string
}
// Updated interfaces for dashboard types

export interface DashboardData {
  total_societies: number
  total_buildings: number
  total_units: number // Changed from total_flats
  occupied_units: number // Changed from occupied_flats
  total_members: number
  recent_notices: Notice[]
  societies_breakdown: SocietyBreakdown[]
  members_list: Member[]
  all_notices: Notice[]
}

export interface SocietySpecificData {
  total_buildings: number
  total_units: number // Changed from total_flats
  occupied_units: number // Changed from occupied_flats
  total_members: number
  recent_notices: Notice[]
  members_list: Member[]
  final_balance: FinalBalanceData | null
}

export interface SocietyBreakdown {
  id: string
  name: string
  society_type: string // Added society_type field
  total_buildings: number
  total_units: number // Changed from total_flats
  total_members: number
}

export interface Member {
  id: string
  first_name: string
  last_name: string
  phone: string
  unit_number: string // Changed from flat_number to be more generic
  building_name?: string | null // Optional since housing societies don't have buildings
  society_type?: string // Added for context
  society_id?: string // Added for context
}

export interface Notice {
  id: string
  title: string
  created_at: string
  status: string
}

export interface FinalBalanceData {
  total_expense: number
  regular_maintenance_amount: number
  total_income: number
  pending_collected_maintenances: number
  total_penalties_paid_current_month: number
  society_balance: number
  final_balance: number
}