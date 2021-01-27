@echo off
del queryResults.json
wget -i query.uri -O queryResults.json
node process-propData.js
del queryResults.json