(function () {
    var el = document.getElementById.bind(document);

    el('btnRender').onclick = function () {
        el('canvas').innerHTML = '<img class="loader" src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Ajax-loader%282%29.gif" />';
        // setTimeout(function () { renderChart(loadData()) }, 1000);
        downloadData(el('frmProperty').value, el('frmInterval').value, 10, function (results) {
            renderChart(buildSpec(results));
        }, function (error) {
            el('canvas').innerHTML = '<p class="error">Error retrieving data</p>';
        })
        return false;
    }

    function downloadData(propertyNumber, interval, maxItems, resultCallback, errorCallback) {
        var maxTimestamp = null;
        var results = [];
        var regexp = RegExp('\\| statcount = ([0-9]+)');

        function advance(data) {
            var pageData = data && data.query && data.query.pages && data.query.pages[Object.keys(data.query.pages)[0]];
            if (!pageData) {
                errorCallback('Unexpected result from API');
                return;
            }

            var revision = pageData.revisions && pageData.revisions[0];
            if (!revision) {
                // end of data
                resultCallback(results);
                return;
            }

            var revTimestamp = revision['timestamp'];
            var revText = revision['*'];
            var parsedRevText = revText.match(regexp);

            maxTimestamp = subtractInterval(new Date(revTimestamp), interval);

            if (parsedRevText) {
                var count = (+parsedRevText[1]) || 0;
                results.push({ timestamp: revTimestamp, count: count });
            } else {
                console.debug('Unable to find in ' + revTimestamp);
            }

            if (results.length >= maxItems) {
                resultCallback(results);
            } else {
                requestNext();
            }
        }

        function requestNext() {
            if (maxTimestamp) {
                httpRequest('https://www.wikidata.org/w/api.php?action=query&format=json&origin=*&prop=revisions&generator=allpages&rvprop=timestamp%7Ccontent%7Cids&rvlimit=1&rvuser=ListeriaBot&gapfrom=Statistics/count/P' + propertyNumber + 'distinct&gapto=Statistics/count/P' + propertyNumber + 'distinct&gapnamespace=4&rvstart=' + encodeURIComponent(maxTimestamp.toISOString()), advance, errorCallback);
            } else {
                httpRequest('https://www.wikidata.org/w/api.php?action=query&format=json&origin=*&prop=revisions&generator=allpages&rvprop=timestamp%7Ccontent%7Cids&rvlimit=1&rvuser=ListeriaBot&gapfrom=Statistics/count/P' + propertyNumber + 'distinct&gapto=Statistics/count/P' + propertyNumber + 'distinct&gapnamespace=4', advance, errorCallback);
            }
        }

        requestNext();
    };

    function subtractInterval(date, interval) {
        // some wiggle room
        date.setMinutes(date.getMinutes() + 30);

        switch (interval) {
            case 'D':
                date.setDate(date.getDate() - 1);
                return date;
            case 'W':
                date.setDate(date.getDate() - 7);
                return date;
            case '2W':
                date.setDate(date.getDate() - 14);
                return date;
            case 'M':
                date.setMonth(date.getMonth() - 1);
                return date;
            case '3M':
                date.setMonth(date.getMonth() - 3);
                return date;
            case '6M':
                date.setMonth(date.getMonth() - 6);
                return date;
            case '1Y':
                date.setYear(date.getYear() - 1);
                return date;
            default:
                throw 'Unsupported interval';
        }
    }

    function httpRequest(url, callback, errorCallback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                var data = JSON.parse(this.response);
                callback(data);
            } else {
                errorCallback(this.status);
            }
        };
        request.onerror = errorCallback;
        request.send();
    }

    function buildSpec(data) {
        var canvas = el('canvas');
        return {
            $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
            description: 'Property usage chart',
            width: canvas.clientWidth - 50,
            height: canvas.clientHeight - 50,
            data: {
                values: data
            },
            mark: 'bar',
            encoding: {
                x: { field: 'timestamp', type: 'temporal' },
                y: { field: 'count', type: 'quantitative' },
                tooltip: { field: 'tooltip' }
            },
            transform: [
                {calculate: "utcFormat(datum.timestamp, '%Y-%m-%d') + ': ' + format(datum.count, ',d')", as: "tooltip"}
            ]
        };
    }

    function renderChart(spec) {
        vegaEmbed('#canvas', spec);
    }

})();
