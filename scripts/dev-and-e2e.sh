#!/bin/sh
# Start Next.js dev server on port 3001, wait for it to be ready, then run Playwright E2E tests
PORT=3001
npx next dev -p $PORT &
NEXT_PID=$!

# Wait for server to be ready (max 60s)
for i in {1..60}; do
  if nc -z localhost $PORT; then
    echo "Next.js dev server is up!"
    break
  fi
  sleep 1
done

# Run Playwright E2E tests
npx playwright test tests/e2e-all.spec.ts
TEST_EXIT=$?

# Kill Next.js dev server
kill $NEXT_PID
exit $TEST_EXIT
