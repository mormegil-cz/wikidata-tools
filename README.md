# wikidata-tools
Various browser-based tools for Wikidata

## Standalone web tools

### Wikidata Blame

A tool to display the history of a Wikidata entity in a structured form.

[https://mormegil-cz.github.io/wikidata-tools/blame/](https://mormegil-cz.github.io/wikidata-tools/blame/)

### Wikidata Driller

Interactive visualization tool for Wikidata entities.

[https://mormegil-cz.github.io/wikidata-tools/driller/](https://mormegil-cz.github.io/wikidata-tools/driller/)

### OID browser

Display a tree structure of [ITU/ISO/IEC OIDs](https://www.wikidata.org/wiki/Property:P3743) represented on Wikidata.

[https://mormegil-cz.github.io/wikidata-tools/oid-browser/](https://mormegil-cz.github.io/wikidata-tools/oid-browser/)

### Property usage chart

Chart of historical property usage data.

[https://mormegil-cz.github.io/wikidata-tools/property-chart/](https://mormegil-cz.github.io/wikidata-tools/property-chart/)

### UDC browser

Display a tree structure of the [Universal Decimal Classification](https://www.wikidata.org/wiki/Property:P1190) data on Wikidata.

[https://mormegil-cz.github.io/wikidata-tools/udc-browser/](https://mormegil-cz.github.io/wikidata-tools/udc-browser/)



## User scripts for Wikidata website

### disambig-detect

Show which sitelinks are disambiguations or redirects.

```
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/disambig-detect/disambig-detect.js');
```

### magic-search (“Search by this”)

Search other items based on the current item properties.

```
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/magic-search/magic-search-dev.js');
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/magic-search/magic-search.css', 'text/css');
```

### sitelink-compare

Compare sitelinks on two items.

```
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/sitelink-compare/sitelink-compare.js');
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/sitelink-compare/sitelink-compare.css', 'text/css');
```

### third-party-url

The missing behavior of external identifiers on Wikidata: Use all available formatter URLs from the property definitions.

```
mw.loader.load('https://mormegil-cz.github.io/wikidata-tools/third-party-url/script.js');
```
