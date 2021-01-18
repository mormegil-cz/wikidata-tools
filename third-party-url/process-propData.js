const fs = require('fs');
const queryResults = require('./queryResults.json');

let results = {};

for (let i = 0; i < queryResults.length; ++i) {
    let row = queryResults[i];
    let list = results[row.p] || [];
    results[row.p] = list;
    list.push({u: row.u, c: row.c});
}

fs.writeFileSync('propertyData.json', JSON.stringify(results));
