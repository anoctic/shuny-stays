-- ==============================================================================
-- seed.sql
-- Seed data for multi-tenant PG & Hostel Accommodation SaaS with Postgres Admin
-- ==============================================================================

-- 1. Create Demo Organizations (Tenants)
INSERT INTO public.organizations (id, name, slug, contact_email, contact_phone, address)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Zenith Luxury PG & Hostels', 'zenith-pg', 'admin@zenithpg.com', '+91 98765 43210', '12th Main, 4th Cross, Koramangala, Bengaluru, Karnataka 560034'),
    ('00000000-0000-0000-0000-000000000002', 'GreenVilla Executive Stays', 'greenvilla-pg', 'support@greenvilla.com', '+91 91234 56789', 'Plot 45, Hitec City, Madhapur, Hyderabad, Telangana 500081')
ON CONFLICT (id) DO NOTHING;

-- 2. Properties for Tenant 1
INSERT INTO public.properties (id, organization_id, name, code, address, city, state, pincode, gender_type, total_floors, warden_name, warden_phone)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Zenith Heights (Men)', 'ZH-M01', '45 Koramangala 5th Block', 'Bengaluru', 'Karnataka', '560095', 'male', 4, 'Ramesh Kumar', '+91 98111 22233'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Zenith Flora (Women)', 'ZF-W01', '12 Indiranagar 100ft Rd', 'Bengaluru', 'Karnataka', '560038', 'female', 3, 'Savita Rao', '+91 98222 33344')
ON CONFLICT (id) DO NOTHING;

-- 3. Rooms
INSERT INTO public.rooms (id, organization_id, property_id, room_number, floor_number, room_type, is_ac, has_attached_bathroom, base_rent_paise, security_deposit_paise)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '101', 1, 'double', true, true, 950000, 1900000),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '102', 1, 'triple', false, true, 750000, 1500000),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '201', 2, 'single', true, true, 1400000, 2800000)
ON CONFLICT (id) DO NOTHING;

-- 4. Beds
INSERT INTO public.beds (id, organization_id, room_id, bed_code, status)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'A', 'occupied'),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'B', 'vacant'),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'A', 'occupied'),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'B', 'occupied'),
    ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'C', 'maintenance'),
    ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'A', 'vacant')
ON CONFLICT (id) DO NOTHING;

-- 5. Residents
INSERT INTO public.residents (id, organization_id, full_name, phone, email, emergency_contact_name, emergency_contact_phone, work_or_college)
VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Aditya Sharma', '+91 99887 76655', 'aditya.sharma@gmail.com', 'Suresh Sharma', '+91 98777 66554', 'Infosys Tech Lead'),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Rohan Verma', '+91 97766 55443', 'rohan.v@outlook.com', 'Vinod Verma', '+91 96655 44332', 'Wipro Software Engineer')
ON CONFLICT (id) DO NOTHING;

-- 6. Leases
INSERT INTO public.leases (id, organization_id, resident_id, bed_id, check_in_date, agreed_rent_paise, security_deposit_paid_paise, status)
VALUES
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-08-01', 950000, 1900000, 'active'),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '2026-09-15', 750000, 1500000, 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Invoices
INSERT INTO public.invoices (id, organization_id, resident_id, lease_id, invoice_number, billing_month, due_date, rent_amount_paise, electricity_amount_paise, total_amount_paise, status)
VALUES
    ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'INV-2026-11-001', '2026-11-01', '2026-11-05', 950000, 45000, 995000, 'paid'),
    ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'INV-2026-11-002', '2026-11-01', '2026-11-05', 750000, 32000, 782000, 'pending')
ON CONFLICT (id) DO NOTHING;

-- 8. Complaints
INSERT INTO public.complaints (id, organization_id, property_id, room_id, resident_id, category, title, description, priority, status)
VALUES
    ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'wifi', 'Wi-Fi speed fluctuation in Room 101', 'Internet signal drops during peak evening hours between 8 PM and 10 PM.', 'medium', 'open'),
    ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'plumbing', 'Bathroom tap dripping', 'Cold water tap in bathroom 102 does not turn off completely.', 'low', 'in_progress')
ON CONFLICT (id) DO NOTHING;

-- 9. Sample Saved SQL Queries for PostgreSQL Studio
INSERT INTO public.pg_saved_queries (id, organization_id, name, description, sql_text)
VALUES
    ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Current Month Rent Collection Rate', 'Calculates collection % and pending dues by property', 
     'SELECT p.name AS property_name, count(i.id) AS total_invoices, sum(i.total_amount_paise)/100.0 AS total_billed_inr, sum(CASE WHEN i.status = ''paid'' THEN i.total_amount_paise ELSE 0 END)/100.0 AS collected_inr FROM public.invoices i JOIN public.residents r ON r.id = i.resident_id JOIN public.leases l ON l.id = i.lease_id JOIN public.beds b ON b.id = l.bed_id JOIN public.rooms rm ON rm.id = b.room_id JOIN public.properties p ON p.id = rm.property_id GROUP BY p.name;'),
    ('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Bed Occupancy & Vacancy Heatmap', 'Shows vacant beds ready for allocation',
     'SELECT p.name AS property, rm.room_number, b.bed_code, b.status, rm.room_type, rm.base_rent_paise/100.0 AS monthly_rent_inr FROM public.beds b JOIN public.rooms rm ON rm.id = b.room_id JOIN public.properties p ON p.id = rm.property_id WHERE b.status = ''vacant'' ORDER BY p.name, rm.room_number;')
ON CONFLICT (id) DO NOTHING;


-- 10. Demo Memberships (Linking Users to Organizations & Roles)
INSERT INTO public.memberships (id, user_id, organization_id, role)
VALUES
    -- Platform Super Admin (Full access, DB Studio, Org switcher, Org Management)
    ('a0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', NULL, 'super_admin'),
    -- Zenith PG Owner (Locked to Zenith Luxury PG organization)
    ('a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'owner'),
    -- Resident Tenant (Locked to Zenith Luxury PG organization, view only their details)
    ('a0000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'resident')
ON CONFLICT (id) DO NOTHING;
