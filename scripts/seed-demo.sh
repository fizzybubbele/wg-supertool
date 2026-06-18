#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS="${DEMO_PASSWORD:-test123456}"
HH_NAME="${DEMO_HOUSEHOLD:-WG Sonnenschein}"
OWNER_EMAIL="demo@wg-supertool.de"

if [[ -f .env.local ]]; then
  # shellcheck disable=SC1091
  source .env.local
fi

ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}"
BASE="${EXPO_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"

if [[ -z "$ANON_KEY" ]]; then
  echo "EXPO_PUBLIC_SUPABASE_ANON_KEY fehlt in .env.local"
  exit 1
fi

echo "→ Supabase-Datenbank zurücksetzen…"
npx supabase db reset >/dev/null

signup() {
  local email="$1"
  local display_name="$2"
  curl -s -X POST "$BASE/auth/v1/signup" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASS\",\"data\":{\"display_name\":\"$display_name\"}}"
}

login() {
  local email="$1"
  curl -s -X POST "$BASE/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$PASS\"}"
}

auth_header() {
  curl -s "$@" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json"
}

ensure_user() {
  local email="$1"
  local display_name="$2"
  local auth_json user_id token

  auth_json="$(signup "$email" "$display_name")"
  user_id="$(echo "$auth_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))")"
  token="$(echo "$auth_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")"

  if [[ -z "$token" ]]; then
    auth_json="$(login "$email")"
    user_id="$(echo "$auth_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))")"
    token="$(echo "$auth_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")"
  fi

  if [[ -z "$token" || -z "$user_id" ]]; then
    echo "Auth fehlgeschlagen für $email: $auth_json"
    exit 1
  fi

  echo "$user_id"
}

echo "→ Demo-Personen anlegen…"
MITCH_ID="$(ensure_user "$OWNER_EMAIL" "Mitch")"
echo "  ✓ Mitch ($OWNER_EMAIL)"
SOPHIE_ID="$(ensure_user "sophie@wg-supertool.de" "Sophie")"
echo "  ✓ Sophie (sophie@wg-supertool.de)"
SEBI_ID="$(ensure_user "sebi@wg-supertool.de" "Sebi")"
echo "  ✓ Sebi (sebi@wg-supertool.de)"
ELIAS_ID="$(ensure_user "elias@wg-supertool.de" "Elias")"
echo "  ✓ Elias (elias@wg-supertool.de)"

TOKEN="$(login "$OWNER_EMAIL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")"

echo "→ Haushalt und Starter-Inhalte anlegen…"
HH_JSON="$(auth_header -X POST "$BASE/rest/v1/households" \
  -H "Prefer: return=representation" \
  -d "{\"name\":\"$HH_NAME\"}")"
HH_ID="$(echo "$HH_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) else d.get('id',''))")"

auth_header -X POST "$BASE/rest/v1/household_members" \
  -d "{\"household_id\":\"$HH_ID\",\"user_id\":\"$MITCH_ID\",\"role\":\"owner\"}" >/dev/null
auth_header -X POST "$BASE/rest/v1/household_members" \
  -d "{\"household_id\":\"$HH_ID\",\"user_id\":\"$SOPHIE_ID\",\"role\":\"member\"}" >/dev/null
auth_header -X POST "$BASE/rest/v1/household_members" \
  -d "{\"household_id\":\"$HH_ID\",\"user_id\":\"$SEBI_ID\",\"role\":\"member\"}" >/dev/null
auth_header -X POST "$BASE/rest/v1/household_members" \
  -d "{\"household_id\":\"$HH_ID\",\"user_id\":\"$ELIAS_ID\",\"role\":\"member\"}" >/dev/null

SEED_BASE="$BASE" \
SEED_ANON_KEY="$ANON_KEY" \
SEED_TOKEN="$TOKEN" \
SEED_HOUSEHOLD_ID="$HH_ID" \
SEED_MITCH_ID="$MITCH_ID" \
SEED_SOPHIE_ID="$SOPHIE_ID" \
SEED_SEBI_ID="$SEBI_ID" \
SEED_ELIAS_ID="$ELIAS_ID" \
python3 "$ROOT/scripts/seed-demo-content.py"

echo ""
echo "Demo-WG bereit — $HH_NAME (4 Personen):"
echo "  Mitch  — $OWNER_EMAIL (owner, Finanzen) ← Demo-Login"
echo "  Sophie — sophie@wg-supertool.de (Putzplan)"
echo "  Sebi   — sebi@wg-supertool.de (Organisation)"
echo "  Elias  — elias@wg-supertool.de (Vorrat)"
echo "  Passwort (alle): $PASS"
echo ""
echo "Inhalte: Einkaufsliste, Vorrat, Putzplan, Termine, 3 Kassenzettel"
echo "App: http://localhost:8081/login"
