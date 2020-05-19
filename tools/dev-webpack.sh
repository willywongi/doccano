#!/usr/bin/env bash

set -o errexit

root="$(dirname "$0")/.."
frontend="${root}/app/server/static"

(
  cd "${frontend}"

  if [[ ! -d node_modules/.bin ]]; then
    echo "Installing dependencies"
    npm install
  fi

  echo "Building static files w/webpack"
  npm run-script build
)
