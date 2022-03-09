(function () {
    let sparqlTemplate = '#defaultView:Map\nSELECT ?item ?itemLabel ?geo WHERE { ?item wdt:P31/wdt:P279* wd:Q16917; wdt:P625 ?geo; wdt:P571 ?inception. FILTER (YEAR(?inception) = $1) SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } }';
    let paramDefs = [{ caption: 'Year: ', type: 'number', default: 1950 }];

    const $ = document.getElementById.bind(document);

    let debounceUpdateTimer = null;

    function createEdit(type, id, paramDef) {
        switch (type) {
            case 'number':
            case 'text':
                const $edit = document.createElement('input');
                $edit.setAttribute('id', id);
                $edit.setAttribute('type', type);
                $edit.setAttribute('value', '' + (paramDef.default || ''));
                return $edit;

            default:
                alert('Invalid/unsupported parameter type');
                throw 'Invalid/unsupported parameter type';
        }
    }

    function updateQuery() {
        let sparqlQuery = sparqlTemplate;
        for (let i = 0; i < paramDefs.length; ++i) {
            const paramValue = $('paramEdit' + i).value;
            sparqlQuery = sparqlQuery.replace(new RegExp('\\$' + (i + 1), 'g'), paramValue);
        }

        $('outputFrame').setAttribute('src', 'https://query.wikidata.org/embed.html#' + encodeURIComponent(sparqlQuery));
    }

    function decodeHashParams() {
        const hash = location.hash;
        if (!hash || !hash.startsWith('#!')) return null;

        const params = {};
        const parts = hash.substring(2).split('&');
        for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];
            const eq = part.indexOf('=');
            if (eq > 0) {
                params[decodeURIComponent(part.substring(0, eq))] = decodeURIComponent(part.substring(eq + 1));
            }
        }
        return params;
    }

    function loadParamsFromLocation() {
        const hashParams = decodeHashParams();
        if (!hashParams || !hashParams.query) return;

        sparqlTemplate = hashParams.query;
        paramDefs = JSON.parse(hashParams.params);
    }

    function init() {
        loadParamsFromLocation();

        
        const $toolbar = $('toolbar');
        for (let i = 0; i < paramDefs.length; ++i) {
            const paramDef = paramDefs[i];
            const $paramBox = document.createElement('div');
            $paramBox.setAttribute('class', 'paramBox');
            const $label = document.createElement('label');
            const editId = 'paramEdit' + i;
            $label.setAttribute('for', editId);
            $label.innerText = paramDef.caption;
            $paramBox.appendChild($label);
            $edit = createEdit(paramDef.type, editId, paramDef)
            $edit.onchange = () => {
                $('outputFrame').setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif');
                if (debounceUpdateTimer) clearTimeout(debounceUpdateTimer);
                debounceUpdateTimer = setTimeout(() => { updateQuery(); }, 300);
            }
            $paramBox.appendChild($edit);
            $toolbar.appendChild($paramBox);
        }

        updateQuery();
    }

    window.onload = init;
})();
