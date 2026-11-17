-- ==============================================================================
-- ApnaPG SaaS — Demo Seed Data for 5-Level Accommodation Hierarchy
-- ==============================================================================

DO $$
DECLARE
  v_owner_id UUID := '00000000-0000-0000-0000-000000000001';
  v_admin_id UUID := '00000000-0000-0000-0000-000000000002';
  v_tenant1_id UUID := '00000000-0000-0000-0000-000000000003';
  v_tenant2_id UUID := '00000000-0000-0000-0000-000000000004';
  
  v_pg_id UUID;
  v_bld_a_id UUID;
  v_bld_b_id UUID;
  v_flr_g_id UUID;
  v_flr_1_id UUID;
  v_rm101_id UUID;
  v_rm102_id UUID;
  v_bed_a1_id UUID;
  v_bed_b1_id UUID;
  v_tenant_rec_id UUID;
BEGIN
  -- 1. Create Demo Profiles
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES 
    (v_owner_id, 'owner', 'Rajesh Sharma (Owner)', '+91 98765 43210'),
    (v_admin_id, 'admin', 'Manoj Kumar (Warden)', '+91 98765 12345'),
    (v_tenant1_id, 'tenant', 'Aarav Patel (Tenant)', '+91 91234 56789'),
    (v_tenant2_id, 'tenant', 'Sneha Verma (Tenant)', '+91 91234 56780')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;

  -- 2. Create PG Brand
  INSERT INTO public.pgs (id, owner_id, name, slug, contact_email, contact_phone, status, subscription_tier, upi_id)
  VALUES (
    gen_random_uuid(),
    v_owner_id,
    'Stanza Living Residency',
    'stanza-residency',
    'contact@stanzaliving.demo',
    '+91 98765 43210',
    'active',
    'growth',
    'stanza@okaxis'
  )
  RETURNING id INTO v_pg_id;

  -- 3. Create Buildings / Blocks
  INSERT INTO public.buildings (id, pg_id, name, gender_type, address, city, state, pincode, warden_name, warden_phone, total_floors, amenities)
  VALUES 
    (gen_random_uuid(), v_pg_id, 'Block A - Krishna Bhawan', 'boys', 'Plot 42, Knowledge Park III', 'Greater Noida', 'Uttar Pradesh', '201310', 'Manoj Kumar', '+91 98765 12345', 3, ARRAY['High Speed WiFi', 'RO Water', 'CCTV 24x7', 'Power Backup']),
    (gen_random_uuid(), v_pg_id, 'Block B - Saraswati Bhawan', 'girls', 'Plot 43, Knowledge Park III', 'Greater Noida', 'Uttar Pradesh', '201310', 'Sunita Devi', '+91 98765 54321', 3, ARRAY['High Speed WiFi', 'Biometric Entry', 'Gym', 'Laundry'])
  RETURNING id INTO v_bld_a_id;

  SELECT id INTO v_bld_b_id FROM public.buildings WHERE pg_id = v_pg_id AND name LIKE 'Block B%';

  -- 4. Create Staff (Admin/Warden) assigned to Block A
  INSERT INTO public.pg_staff (user_id, pg_id, assigned_building_ids, permissions, designation)
  VALUES (
    v_admin_id,
    v_pg_id,
    ARRAY[v_bld_a_id],
    ARRAY['manage_tenants', 'collect_cash', 'resolve_complaints', 'manage_mess'],
    'Head Warden'
  );

  -- 5. Create Floors in Block A
  INSERT INTO public.floors (id, pg_id, building_id, floor_number, floor_name)
  VALUES (gen_random_uuid(), v_pg_id, v_bld_a_id, 0, 'Ground Floor')
  RETURNING id INTO v_flr_g_id;

  INSERT INTO public.floors (id, pg_id, building_id, floor_number, floor_name)
  VALUES (gen_random_uuid(), v_pg_id, v_bld_a_id, 1, '1st Floor')
  RETURNING id INTO v_flr_1_id;

  -- 6. Create Rooms (Trigger trg_rooms_auto_create_beds will auto-create beds!)
  INSERT INTO public.rooms (id, pg_id, building_id, floor_id, room_number, sharing_type, room_type, is_ac, base_rent_monthly, default_deposit)
  VALUES (gen_random_uuid(), v_pg_id, v_bld_a_id, v_flr_1_id, '101', 2, 'double_sharing', true, 9500.00, 19000.00)
  RETURNING id INTO v_rm101_id;

  INSERT INTO public.rooms (id, pg_id, building_id, floor_id, room_number, sharing_type, room_type, is_ac, base_rent_monthly, default_deposit)
  VALUES (gen_random_uuid(), v_pg_id, v_bld_a_id, v_flr_1_id, '102', 3, 'triple_sharing', false, 7500.00, 15000.00)
  RETURNING id INTO v_rm102_id;

  -- Pick auto-generated Bed A from Room 101
  SELECT id INTO v_bed_a1_id FROM public.beds WHERE room_id = v_rm101_id AND bed_name = 'Bed A' LIMIT 1;
  SELECT id INTO v_bed_b1_id FROM public.beds WHERE room_id = v_rm101_id AND bed_name = 'Bed B' LIMIT 1;

  -- 7. Add Tenant
  INSERT INTO public.tenants (
    id, user_id, pg_id, building_id, room_id, bed_id, full_name, phone, email,
    rent_amount, deposit_amount, check_in_date
  )
  VALUES (
    gen_random_uuid(),
    v_tenant1_id,
    v_pg_id,
    v_bld_a_id,
    v_rm101_id,
    v_bed_a1_id,
    'Aarav Patel',
    '+91 91234 56789',
    'aarav.patel@student.demo',
    9500.00,
    19000.00,
    CURRENT_DATE - INTERVAL '30 days'
  )
  RETURNING id INTO v_tenant_rec_id;

  -- 8. Add Rent Payment Invoice
  INSERT INTO public.rent_payments (
    pg_id, building_id, tenant_id, invoice_number, billing_month, due_date,
    rent_amount, electricity_amount, maintenance_amount, total_amount, amount_paid,
    status, payment_mode, utr_number
  )
  VALUES (
    v_pg_id,
    v_bld_a_id,
    v_tenant_rec_id,
    'INV-2026-11-001',
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    CURRENT_DATE + INTERVAL '5 days',
    9500.00,
    650.00,
    500.00,
    10650.00,
    10650.00,
    'verified',
    'upi',
    'UPI2611984210'
  );

  -- 9. Add Complaint
  INSERT INTO public.complaints (
    pg_id, building_id, room_id, tenant_id, category, title, description, priority, status
  )
  VALUES (
    v_pg_id,
    v_bld_a_id,
    v_rm101_id,
    v_tenant_rec_id,
    'WiFi',
    'WiFi slow in Room 101',
    'Ping is too high during online lectures between 6 PM to 9 PM.',
    'medium',
    'in_progress'
  );

  -- 10. Add Mess Menu (Weekly)
  INSERT INTO public.mess_menu (pg_id, building_id, day_of_week, meal_type, menu_items, start_time, end_time)
  VALUES 
    (v_pg_id, NULL, 'monday', 'breakfast', 'Aloo Paratha, Curd, Pickle, Tea / Coffee', '07:30', '09:30'),
    (v_pg_id, NULL, 'monday', 'lunch', 'Rajma Masala, Steamed Rice, Roti, Boondi Raita, Salad', '12:30', '14:30'),
    (v_pg_id, NULL, 'monday', 'dinner', 'Paneer Butter Masala, Dal Tadka, Butter Roti, Gulab Jamun', '20:00', '22:00'),
    (v_pg_id, v_bld_a_id, 'tuesday', 'breakfast', 'Poha, Boiled Eggs / Banana, Tea / Coffee', '07:30', '09:30');

  -- 11. Add Building Expense
  INSERT INTO public.expenses (pg_id, building_id, category, title, amount, expense_date, recorded_by, notes)
  VALUES (
    v_pg_id,
    v_bld_a_id,
    'Plumbing',
    'RO Filter Cartridge Replacement (Block A)',
    1850.00,
    CURRENT_DATE - INTERVAL '2 days',
    v_admin_id,
    'Vendor invoice #RO-418 Paid via Cash'
  );

END $$;
