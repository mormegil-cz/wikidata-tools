(function () {
    var el = document.getElementById.bind(document);

    el('btnRender').onclick = function () {
        el('canvas').innerHTML = '<img class="loader" src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Ajax-loader%282%29.gif" />';
        // setTimeout(function () { renderChart(loadData()) }, 1000);
        downloadAllData(el('frmProperty').value, el('frmInterval').value, 10, function (results) {
            renderChart(buildSpec(results));
        }, function (error) {
            el('canvas').innerHTML = '<p class="error">Error retrieving data</p>';
        })
        return false;
    }

    var availableData = []; // {from: 123456, to: 789000, value: 1234}

    function findFromAvailableData(time) {
        // TODO: binary search?
        for (var i = 0; i < availableData.length; ++i) {
            var curr = availableData[i];
            if (curr.from <= time && curr.to >= time) return curr.value;
            if (curr.to < time) break;
        }
        return null;
    }

    function storeToAvailableData(minTime, maxTime, value) {
        var newEntry = {from: minTime, to: maxTime, value: value};
        for (var i = 0; i < availableData.length; ++i) {
            var curr = availableData[i];
            if (curr.from <= maxTime && curr.to >= minTime) {
                // should not happen…
                return;
            }
            if (curr.to < minTime) {
                availableData.splice(i, 0, newEntry);
                return;
            }
        }
        availableData.push(newEntry);
    }

    function findOrDownload(propertyNumber, date, resultCallback, errorCallback) {
        var available = findFromAvailableData(time);
        if (available !== null) {
            resultCallback(available);
            return;
        }
        downloadValue(propertyNumber, date, resultCallback, errorCallback);
    }

    function downloadAllData(propertyNumber, endTimeStr, interval, maxItems, resultCallback, errorCallback) {
        var endTime = Date.parse(endTimeStr);
        if (isNaN(endTime)) endTime = Date.now();
        var startTime = subtractInterval(endTime, interval, maxItems);
        if (startTime < MIN_TIME) startTime = MIN_TIME;
        interval = (endTime - startTime) / maxItems;
        if (interval < 86400000) {
            interval = 86400000;
            maxItems = Math.max(1, Math.floor((endTime - startTime) / interval));
        }
        var successCount = 0;
        var remainingItems = maxItems;
        var errors = [];
        var results = [];
        for (var i = 0; i < maxItems; ++i)
        {
            var date = new Date(startTime + i * interval);
            findOrDownload(propertyNumber, date, function(count) {
                results.push({ timestamp: date.toISOString(), count: count });
                ++successCount;
                oneDone();
            }, function(error) {
                errors.push(error);
                oneDone();
            });
        }

        function oneDone() {
            --remainingItems;
            if (remainingItems) return;

            if (successCount) resultCallback(results);
            else errorCallback(errors);
        }
    }

    function downloadValue(propertyNumber, date, resultCallback, errorCallback) {
        if (date.valueOf() < MAX_HISTORY_DATE) {
            downloadValueFromHistory(propertyNumber, date, resultCallback, errorCallback);
        } else {
            downloadValueFromTemplate(propertyNumber, date, resultCallback, errorCallback);
        }
    }

    function downloadValueFromHistory(propertyNumber, date, resultCallback, errorCallback) {
        var year = date.getUTCFullYear();
        getYearIndex(year, function(yearIndex) {
            var dayRange = findInHistoryIndex(yearIndex, date.getUTCMonth(), date.getUTCDate());
            if (!dayRange) {
                // TODO: Try another year, if available
                errorCallback();
                return;
            }

            var url = "https://raw.githubusercontent.com/mormegil-cz/wdprop-usage-history/master/" + year + "/" + dayRange.minMonth + "/" + dayRange.minDay + "/" + propertyNumber + ".json";
            httpRequest(url, function(data) {
                var minTime = new Date(year, dayRange.minMonth, dayRange.minDay).getTime();
                var maxTime = new Date(year, dayRange.maxMonth, dayRange.maxDay).getTime();
                storeToAvailableData(minTime, maxTime, data);
                resultCallback(data);
            }, errorCallback);
        }, errorCallback);
    }

    function getYearIndex(year, resultCallback, errorCallback) {
        httpRequest("https://raw.githubusercontent.com/mormegil-cz/wdprop-usage-history/master/" + year + "/_index.json", resultCallback, errorCallback);
    }

    function findInHistoryIndex(yearIndex, month, day) {
        if (!yearIndex) return null;
        var m = month;
        var d = day;
        while (m > 0) {
            var monthIndex = yearIndex[m];
            if (monthIndex) {
                var prev = null;
                for (var i = 0; i < monthIndex.length; ++i) {
                    if (monthIndex[i] >= d) break;
                    prev = monthIndex[i];
                }
                if (prev) {
                    return { minMonth: m, minDay: prev, maxMonth: month, maxDay: day };
                }
            }
            --m;
            d = 31;
        }
        return null;
    }

    function downloadAllData(propertyNumber, interval, maxItems, resultCallback, errorCallback) {
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

            maxTimestamp = subtractInterval(new Date(revTimestamp), interval,1);

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

    function subtractInterval(date, interval, count) {
        // some wiggle room
        date.setMinutes(date.getMinutes() + 30);

        switch (interval) {
            case 'D':
                date.setDate(date.getDate() - count);
                return date;
            case 'W':
                date.setDate(date.getDate() - 7 * count);
                return date;
            case '2W':
                date.setDate(date.getDate() - 14 * count);
                return date;
            case 'M':
                date.setMonth(date.getMonth() - count);
                return date;
            case '3M':
                date.setMonth(date.getMonth() - 3 * count);
                return date;
            case '6M':
                date.setMonth(date.getMonth() - 6 * count);
                return date;
            case '1Y':
                date.setYear(date.getYear() - count);
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
