#!/bin/sh
if [ -f queryResults.json ]; then rm queryResults.json; fi
set -e

wget -i query.uri -O queryResults.json
node process-propData.js
rm queryResults.json
git diff --word-diff=color
