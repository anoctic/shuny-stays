const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lrghfxcmygytjkzaeccd.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2hmeGNteWd5dGpremFlY2NkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDkyOTk2MywiZXhwIjoyMTEwNTA1OTYzfQ.J7ch5P-7fuWg7_bp0ivBJXh8asf-A-FrUnEPzVIJhRc";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("Fetching all PGs from Supabase...");
  const { data: pgs, error } = await supabase.from("pgs").select("id, name, slug, owner_id, contact_phone, owner_initial_password");
  if (error) {
    console.error("Error fetching pgs:", error);
    process.exit(1);
  }

  console.log(`Found ${pgs.length} PGs.`);

  for (const pg of pgs) {
    let password = pg.owner_initial_password;
    if (!password) {
      const cleanPhone = (pg.contact_phone || "").replace(/\D/g, "").slice(-4) || "2026";
      password = `Shuny@${cleanPhone}`;
      console.log(`Setting password for PG: "${pg.name}" (${pg.slug}) -> ${password}`);

      // Update Supabase Auth if owner_id exists
      if (pg.owner_id) {
        const { error: authErr } = await supabase.auth.admin.updateUserById(pg.owner_id, {
          password: password,
          email_confirm: true,
        });
        if (authErr) {
          console.warn(`Auth update warning for owner ${pg.owner_id}:`, authErr.message);
        } else {
          console.log(`Auth password updated for user ${pg.owner_id}`);
        }
      }

      // Update pgs table
      const { error: pgUpdateErr } = await supabase.from("pgs").update({
        owner_initial_password: password,
      }).eq("id", pg.id);

      if (pgUpdateErr) {
        console.error(`Failed to update pgs table for ${pg.id}:`, pgUpdateErr.message);
      } else {
        console.log(`PG ${pg.name} updated with owner_initial_password: ${password}`);
      }
    } else {
      console.log(`PG "${pg.name}" already has owner_initial_password: ${password}`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
