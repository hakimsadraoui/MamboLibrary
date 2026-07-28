#!/usr/bin/env bash
#
# Downloads the generated story assets into public/assets/ under the filenames
# the scenes expect, then regenerates src/assets.ts.
#
# These are the Higgsfield jobs listed in ../build-assets/ASSETS.md. The session
# that generated them could not run this itself — the CDN host is blocked by
# that environment's egress policy — but from a normal machine it just works.
#
#   ./scripts/fetch-assets.sh
#
# If a URL 403s or 404s the signed link has aged out. Re-export that job from
# the Higgsfield UI and drop it in by hand; ASSETS.md has the job ID and the
# original prompt for every one.

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3F5N07sMJkNYiHSTxPMQoNkslAe"
DEST="public/assets"
mkdir -p "$DEST"

# filename<TAB>remote basename
ASSETS=$(cat <<'EOF'
lab-bg.png	hf_20260727_234407_58f2c9bf-416a-4b35-8ec7-624fe56d52d9.png
kodak-plant-bg.png	hf_20260727_234409_a759fc35-ba13-43f3-b4ce-6e72cef762c3.png
loft-bg.png	hf_20260727_234411_dd92882d-d7c5-48b1-b9ec-106037edffa4.png
dust1.png	hf_20260727_234514_386e810e-e415-4b85-b5b1-950899811040.png
dust2.png	hf_20260727_234516_3a45f20d-9c65-4997-b43d-e3f85ca37831.png
sasson-portrait.png	hf_20260727_234647_86332870-3cdf-4cd5-aa5f-9969ada2213d.png
exec.png	hf_20260727_234650_d659d3e9-dbf2-4fdd-ae7e-50e255e31fa1.png
grim-exec.png	hf_20260727_234654_204f43ad-f499-4c86-a27b-276e7b0aefc6.png
founder-char.png	hf_20260727_234657_fe8c6655-8b29-4044-8ac0-d3a8085319c3.png
hand-left.png	hf_20260727_234700_b30c209b-b9fd-47fb-878e-a774139a8aea.png
hand-right.png	hf_20260727_234707_ca3d96bb-947a-493c-a359-c46538df9ffb.png
phone-cut.png	hf_20260727_234710_41ede663-3a91-4f2b-a665-3b68fdac0782.png
lamp.png	hf_20260727_234713_5ebb61d9-035d-48fc-9664-3e1f276aa8e5.png
news-nofilm.png	hf_20260727_234715_8788e7e4-e40c-47dd-9f2f-601370ca54e3.png
news-noprints.png	hf_20260727_234718_0749fc9c-6dd1-41c6-b110-1a94a764f5fb.png
news-nowaiting.png	hf_20260727_235011_76dab23a-b42a-44dc-9567-cfee710033dc.png
old-sasson.png	hf_20260727_235008_934ce9a0-b58a-4708-9deb-9e10399f4ba0.png
EOF
)

ok=0; failed=0; failures=()

while IFS=$'\t' read -r name remote; do
  [ -z "$name" ] && continue
  printf '  %-24s' "$name"
  if curl -fsS --max-time 90 -o "$DEST/$name.part" "$BASE/$remote"; then
    mv "$DEST/$name.part" "$DEST/$name"
    printf 'ok  (%s)\n' "$(du -h "$DEST/$name" | cut -f1 | tr -d ' ')"
    ok=$((ok + 1))
  else
    rm -f "$DEST/$name.part"
    printf 'FAILED\n'
    failed=$((failed + 1)); failures+=("$name")
  fi
done <<< "$ASSETS"

echo
echo "downloaded $ok, failed $failed"
if [ "$failed" -gt 0 ]; then
  echo "re-export these from the Higgsfield UI (job IDs in ../build-assets/ASSETS.md):"
  printf '  · %s\n' "${failures[@]}"
fi

echo
node scripts/sync-assets.mjs

cat <<'DONE'

Next:
  npm run dev     open Studio and look at every scene with real plates in
  npm run build   render out/kodak-reel.mp4

Nothing here has been eyeballed yet — check the three newspaper headlines
(text rendering is the likeliest thing to be wrong) and the cut-out edges on
the two characters holding wired objects.
DONE
