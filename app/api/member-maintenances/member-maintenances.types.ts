export type GetMemberMaintenance = {
  // Existing fields from member_monthly_maintenance_dues
  id: string;
  society_id: string;
  building_id: string;
  flat_id: string;
  member_ids: string[];
  month_year: Date;
  maintenance_amount: number;
  maintenance_paid: boolean;
  maintenance_paid_at?: Date;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  razorpay_payment_id?: string;

  // Aggregated fields from joins
  society_name: string;
  member_names: string[];
  building_name: string;
  flat_number: string;
  housing_unit_number?: string;
  user_ids: string[];

  // Razorpay payment details
  razorpay_payment_id_full?: string;
  razorpay_order_id?: string;
  bank_rrn?: string;
  invoice_id?: string;
  payment_method?: string;
  payer_upi_id?: string;
  payer_account_type?: string;
  customer_contact?: string;
  customer_email?: string;
  total_fee?: number;
  razorpay_fee?: number;
  gst?: number;
  payment_description?: string;
  payment_created_at?: Date;
};
