const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function seed() {
  console.log("Starting safe, non-destructive baseline seeding...");

  // 1. Fetch real bed IDs from DB
  const { data: dbBeds, error: fetchBedsErr } = await supabase.from('beds').select('id, room_id, bed_name');
  if (fetchBedsErr || !dbBeds) {
    console.error("Could not fetch beds:", fetchBedsErr);
    return;
  }

  const bedMap = {};
  for (const b of dbBeds) {
    bedMap[`${b.room_id}_${b.bed_name}`] = b.id;
  }

  const bedA_101 = bedMap['10000000-0000-0000-0000-000000000001_Bed A'];
  const bedB_101 = bedMap['10000000-0000-0000-0000-000000000001_Bed B'];
  const bedA_102 = bedMap['10000000-0000-0000-0000-000000000002_Bed A'];

  console.log("Found beds:", { bedA_101, bedB_101, bedA_102 });

  // Update bed statuses to occupied for the 3 beds
  await supabase.from('beds').update({ status: 'occupied' }).in('id', [bedA_101, bedB_101, bedA_102]);

  // 2. Tenants
  const tenants = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      user_id: 'ab09819e-4e31-4f7e-b78f-5c2d57d92330',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      room_id: '10000000-0000-0000-0000-000000000001',
      bed_id: bedA_101,
      full_name: 'Rohan Verma',
      phone: '9876501234',
      email: '9876501234@login.shunyos.app',
      emergency_contact_name: 'Ramesh Verma',
      emergency_contact_phone: '9876509999',
      work_or_college: 'Christ University',
      id_proof_type: 'Aadhaar',
      id_proof_number: 'XXXX-XXXX-4321',
      rent_amount: 8500,
      deposit_amount: 8500,
      check_in_date: '2026-08-01',
      is_active: true
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      user_id: 'd3db6833-cd9d-4764-b793-63e21954672f',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      room_id: '10000000-0000-0000-0000-000000000001',
      bed_id: bedB_101,
      full_name: 'Test Tenant Rahul',
      phone: '9876543299',
      email: '9876543299@login.shunystays.app',
      emergency_contact_name: 'Sunil Kumar',
      emergency_contact_phone: '9876543200',
      work_or_college: 'Infosys Tech Park',
      id_proof_type: 'PAN',
      id_proof_number: 'ABCDE1234F',
      rent_amount: 8500,
      deposit_amount: 8500,
      check_in_date: '2026-09-01',
      is_active: true
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      user_id: 'a82419ea-16d3-4169-b477-c423c92a355a',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      room_id: '10000000-0000-0000-0000-000000000002',
      bed_id: bedA_102,
      full_name: 'New Tenant Verified',
      phone: '9876500001',
      email: '9876500001@login.shunystays.app',
      emergency_contact_name: 'Amitabh Sen',
      emergency_contact_phone: '9876500002',
      work_or_college: 'Wipro Technologies',
      id_proof_type: 'Aadhaar',
      id_proof_number: 'XXXX-XXXX-9988',
      rent_amount: 7500,
      deposit_amount: 7500,
      check_in_date: '2026-10-01',
      is_active: true
    }
  ];
  const { error: tntErr } = await supabase.from('tenants').upsert(tenants, { onConflict: 'id' });
  if (tntErr) console.error("Tenants error:", tntErr); else console.log("✓ Tenants seeded");

  // 3. Rent Payments
  const rentPayments = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000001',
      invoice_number: 'INV-202611-001',
      billing_month: '2026-11-01',
      amount: 8500,
      status: 'settled_with_owner',
      payment_mode: 'admin_upi',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      collected_by_name: 'Anoctic',
      collected_by_role: 'owner',
      collected_at: '2026-11-03T10:00:00Z'
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000002',
      invoice_number: 'INV-202611-002',
      billing_month: '2026-11-01',
      amount: 8500,
      status: 'collected_by_admin',
      payment_mode: 'admin_upi',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      collected_by_name: 'Anoctic',
      collected_by_role: 'owner',
      collected_at: '2026-11-04T12:00:00Z'
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000003',
      invoice_number: 'INV-202611-003',
      billing_month: '2026-11-01',
      amount: 7500,
      status: 'collected_by_admin',
      payment_mode: 'cash',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      collected_by_name: 'Anoctic',
      collected_by_role: 'owner',
      collected_at: '2026-11-05T00:00:00Z'
    }
  ];
  const { error: rentErr } = await supabase.from('rent_payments').upsert(rentPayments, { onConflict: 'id' });
  if (rentErr) console.error("Rent Payments error:", rentErr); else console.log("✓ Rent Payments seeded");

  // 4. Security Deposits
  const deposits = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000001',
      expected_amount: 8500,
      paid_amount: 8500,
      status: 'paid',
      payment_mode: 'upi',
      transaction_ref: 'DEP/UPI/882109',
      collected_at: '2026-08-01T10:00:00Z',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      deduction_amount: 0,
      refunded_amount: 0
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000002',
      expected_amount: 8500,
      paid_amount: 8500,
      status: 'paid',
      payment_mode: 'upi',
      transaction_ref: 'DEP/UPI/991204',
      collected_at: '2026-09-01T10:00:00Z',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      deduction_amount: 0,
      refunded_amount: 0
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      pg_id: '23594b9e-da90-4884-95aa-5f978d91a0d2',
      building_id: 'a0000000-0000-0000-0000-000000000001',
      tenant_id: '30000000-0000-0000-0000-000000000003',
      expected_amount: 7500,
      paid_amount: 7500,
      status: 'paid',
      payment_mode: 'cash',
      collected_at: '2026-10-01T10:00:00Z',
      collected_by: 'cb1fd99b-796d-4b76-965a-c40a2ee11213',
      deduction_amount: 0,
      refunded_amount: 0
    }
  ];
  const { error: depErr } = await supabase.from('security_deposits').upsert(deposits, { onConflict: 'id' });
  if (depErr) console.error("Deposits error:", depErr); else console.log("✓ Security Deposits seeded");

  console.log("ALL baseline operational entities are now LIVE in Supabase!");
}

seed().catch(err => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
