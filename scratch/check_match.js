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
  console.log("Match Metadata:", JSON.stringify(match.metadata, null, 2));
  
  const players = match.players?.all_players || [];
  if (players.length > 0) {
    console.log("Player 1 schema keys:", Object.keys(players[0]));
    console.log("Player 1 rank info:", {
      name: players[0].name,
      current_tier: players[0].current_tier,
      tier: players[0].tier,
      rank: players[0].rank,
      current_tier_patched: players[0].current_tier_patched
    });
  } else {
    console.log("No players in match.");
  }
}

checkMatch();
