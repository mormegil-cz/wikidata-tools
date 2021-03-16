@echo off
if exist queryResults.json del queryResults.json
wget -i query.uri -O queryResults.json
node process-propData.js
if errorlevel 1 goto :eof
del queryResults.json