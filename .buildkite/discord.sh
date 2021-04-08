STAGE=$BUILDKITE_BRANCH
if [ "$STAGE" = 'main' ]; then
  STAGE='production'
fi

if [ "$STAGE" != 'production' ] && [ "$STAGE" != 'staging' ]; then
  echo 'Stage '$STAGE' unknown, skipping Discord'
  exit 0
fi

curl -sSf -H 'Content-Type: application/json' \
  --request POST \
  --data '{"content": "Deploy for '"$BUILDKITE_PIPELINE_SLUG"' '$STAGE' is finished"}' \
  "$DISCORD_WEBHOOK_URL"
