export type AssignedMemberResponse = {
  user_id: string;
  move_in_date: string;
  created_by: string;
  created_at: string;
  member_name: string;
  society_name: string;
  building_name: string;
  flats?: Array<{
    flat_id: string;
    flat_number: string;
    floor_number: number;
  }>;
  housing_units?: Array<{
    housing_id: string;
    unit_number: string;
    unit_type: string;
    square_foot: number;
  }>;
  // Legacy fields for backward compatibility
  unit_number?: string;
  unit_type?: string;
  square_foot?: number;
}