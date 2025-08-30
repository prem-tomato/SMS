export type Fines = {
  id: string;
  society_id: string;
  building_id: string;
  flat_id: string;
  amount: number;
  reason: string;
  is_paid: boolean;
  paid_at: Date;
  building_name: string;
  flat_number: string;
  society_name: string;
};

export type HousingFines = {
  id: string;
  society_id: string;
  unit_id: string;
  amount: number;
  reason: string;
  is_paid: boolean;
  paid_at: Date;
  society_name: string;
  unit_number: string;
};
