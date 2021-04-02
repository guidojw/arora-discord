STAGE=$BUILDKITE_BRANCH
if [ "$STAGE" = 'main' ]; then
  STAGE='production'
fi

if [ "$STAGE" != 'production' ] && [ "$STAGE" != 'staging' ]; then
  echo 'Stage '$STAGE' unknown, skipping Sentry'
  exit 0
fi

curl -sSf -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '"$SENTRY_API_TOKEN" \
  --request POST \
  --data '{"version": "'"$(date)"'", "ref": "'"$BUILDKITE_COMMIT"'", "environment": "'"$STAGE"'"}' \
  https://sentry.io/api/0/projects/ns-roblox/nsadmin-discord/releases/
