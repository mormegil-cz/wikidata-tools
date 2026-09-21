const fs = require('fs');
const queryResults = require('./queryResults.json').results.bindings;

let results = {};

for (let i = 0; i < queryResults.length; ++i) {
    let row = queryResults[i];
	let p = row.p.value;
    let list = results[p] || [];
    results[p] = list;
    if (!row.c) {
        if (row.u.type === 'uri' && row.u.value && row.u.value.startsWith('http://www.wikidata.org/.well-known/genid/')) {
            console.warn('Novalue formatter claim', row);
            continue;
        }
        console.error('Missing c', row);
        throw 'Missing c';
    }
    list.push({u: row.u.value, c: row.c.value, r: row.r && row.r.value});
}

fs.writeFileSync('propertyData.json', JSON.stringify(results));
