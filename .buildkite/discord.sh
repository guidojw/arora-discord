STAGE=$BUILDKITE_BRANCH
if [ "$STAGE" = 'master' ]; then
  STAGE='production'
fi

if [ "$STAGE" != 'production' ]; then
  echo 'Stage '$STAGE' unknown.. skipping Discord'
  exit 0
fi

curl -sSf -H 'Content-Type: application/json' \
--request POST \
--data '{"content": "Deploy for '$STAGE' is finished"}' \
"$DISCORD_WEBHOOK_URL"
