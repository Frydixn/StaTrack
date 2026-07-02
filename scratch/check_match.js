const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://behtajsikoiewrytqpvl.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatch() {
  const { data, error } = await supabase
    .from("player_matches")
    .select("match_data")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Database error:", error.message);
    return;
  }

  if (!data) {
    console.log("No matches found in DB.");
    return;
  }

  const match = data.match_data;
  const rounds = match.rounds || [];
  const fs = require("fs");
  const path = require("path");

  const output = {
    metadata: match.metadata,
    round_keys: rounds.length > 0 ? Object.keys(rounds[0]) : [],
    player_stats_keys: (rounds.length > 0 && rounds[0].player_stats?.length > 0) 
      ? Object.keys(rounds[0].player_stats[0]) 
      : [],
    sample_player_stats: (rounds.length > 0 && rounds[0].player_stats?.length > 0) 
      ? rounds[0].player_stats[0] 
      : null,
    sample_kill: match.kills?.length > 0 ? match.kills[0] : null
  };

  fs.writeFileSync(
    path.join(__dirname, "round_data.json"),
    JSON.stringify(output, null, 2)
  );
  console.log("Details saved to scratch/round_data.json successfully.");
}

checkMatch();
