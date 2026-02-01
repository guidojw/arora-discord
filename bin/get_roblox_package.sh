#!/usr/bin/env bash

# Usage: ROBLOX_API_KEY=<key> ./get_roblox_package.sh <asset_id>
# Used API key must be a User API Key with scope "legacy-assets" and have
# permission "Create and edit community experiences" on the group the asset is
# created under.

ASSET_ID=$1

RESULT=$(curl -sS "https://apis.roblox.com/asset-delivery-api/v1/assetId/$ASSET_ID" \
  -H "x-api-key: $ROBLOX_API_KEY"
) || {
    echo 'An error occurred:'
    echo "$RESULT"
    exit 1
}

LOCATION=$(echo "$RESULT" | jq -r .location)
curl -sS "$LOCATION" \
  --output Package.rbxmx \
  --compressed \
|| {
  echo 'An error occurred:'
  echo "$RESULT"
  exit 1
}

cat << EOF | lune run -
local fs = require("@lune/fs")
local roblox = require("@lune/roblox")

print(roblox.deserializeModel(fs.readFile("Package.rbxmx"))[1].Source)
EOF
