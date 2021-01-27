const fs = require('fs');
const queryResults = require('./queryResults.json').results.bindings;

let results = {};

for (let i = 0; i < queryResults.length; ++i) {
    let row = queryResults[i];
	let p = row.p.value;
    let list = results[p] || [];
    results[p] = list;
    list.push({u: row.u.value, c: row.c.value});
}

fs.writeFileSync('propertyData.json', JSON.stringify(results));
