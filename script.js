// load data
var gConfirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
var gDeathsCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';

var gCsvData = {'confirmed': null, 'deaths': null};

getCasesCsvUrl(gConfirmedCsvUrl, 'confirmed', gCsvData);
getCasesCsvUrl(gDeathsCsvUrl, 'deaths', gCsvData);

function getCasesCsvUrl(url, key, data) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            gCsvData[key] = results.data;

            analyzeData(gCsvData);

        }
    })
}

function analyzeData(csvData) {
    if ((csvData['confirmed'] == null) || (csvData['deaths'] == null)) {
        return;
    }
    
    var casesData = {
                      'dates': [],
                      'countries':
                        {
                            'local':        {'arabic_name': 'البلاد',           'confirmed': [], 'deaths': [], 'population': 8618562 , 'beds_per_thousand': 3.02},
                            'Italy':        {'arabic_name': 'إيطاليا',         'confirmed': [], 'deaths': [], 'population': 60485231, 'beds_per_thousand': 3.18},
                            'Spain':        {'arabic_name': 'إسبانيا',         'confirmed': [], 'deaths': [], 'population': 46749991, 'beds_per_thousand': 2.97},
                            'Germany':      {'arabic_name': 'ألمانيا',         'confirmed': [], 'deaths': [], 'population': 83712702, 'beds_per_thousand': 8},
                            'Korea, South': {'arabic_name': 'كوريا الجنوبية', 'confirmed': [], 'deaths': [], 'population': 51257511, 'beds_per_thousand': 12.27},
                            'Turkey':       {'arabic_name': 'تركيا',            'confirmed': [], 'deaths': [], 'population': 84093774, 'beds_per_thousand': 2.81},
                            'Japan':        {'arabic_name': 'اليابان',          'confirmed': [], 'deaths': [], 'population': 26578042, 'beds_per_thousand': 13.05},
                        }
                    };

    extractCasesData(csvData, casesData);

    
    drawTotalCasesChart(casesData);
    drawDailyCasesChart(casesData);
    drawGrowthFactorChart(casesData);

    drawVsWorldCharts(casesData);

    displayDoublesIn(casesData);
}

function extractCasesData(csvData, casesData) {
    
    var extractDates = true;
    var caseTypes = ['confirmed', 'deaths'];

    for (iCaseType = 0; iCaseType < caseTypes.length; iCaseType++) {
        caseType = caseTypes[iCaseType];

        for (country in casesData['countries']) {
            var myData = csvData[caseType].filter(function(rowData) {
                var countryCompare = (country == 'local') ? 'Israel' : country;
                return ('Country/Region' in rowData) && (rowData['Country/Region'] == countryCompare);
            });
            myData = myData[0];

            for (var key in myData) {
                if (isRelevantDataKey(key)) {
                    casesData['countries'][country][caseType].push(parseInt(myData[key]));
                    if (extractDates) {
                        casesData['dates'].push(key);
                    }
                }
            }

            extractDates = false;
        }
    }
} 

function isRelevantDataKey(key) {
    var startDate = moment('2/20/20', 'M/D/YY', true);
    var thisDate = moment(key, 'M/D/YY', true);
    var isDate = thisDate.isValid();
    var isAfterStartDate = thisDate.isSameOrAfter(startDate);
    return isDate && isAfterStartDate;
}

function drawTotalCasesChart(casesData) {
    var ctx = document.getElementById('totalCasesChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'مصابون',
                'fill': false,
                'borderColor': 'rgb(0, 150, 255)',
                'lineTension': 0.1,
                data: casesData['countries']['local']['confirmed']
            },
            {
                'label': 'وفيات',
                'fill': false,
                'borderColor': 'rgb(187, 17, 0)',
                'lineTension': 0.1,
                data: casesData['countries']['local']['deaths']
            }
            ],
            labels: casesData['dates']
        },
        options: {
            responsive: true,
            title: {
                text: 'مجمل الحالات في البلاد',
                display: false,
                fontSize: 40,
            },
            scales: {
                xAxes: [{
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'عدد الحالات',
                        fontSize: 20
                    },
                }]
            }
        }
    });
}

function drawDailyCasesChart(casesData) {
    var totalOpenCases = []
    for (var i = 0; i < casesData['countries']['local']['confirmed'].length; i++) {
        totalOpenCases.push(casesData['countries']['local']['confirmed'][i] - casesData['countries']['local']['deaths'][i]);
    }

    var dailyOpenCases = []
    var dailyDeaths = []

    for (var i = 1; i < casesData['countries']['local']['confirmed'].length; i++) {
        dailyOpenCases.push(totalOpenCases[i] - totalOpenCases[i - 1]);
        dailyDeaths.push(casesData['countries']['local']['deaths'][i] - casesData['countries']['local']['deaths'][i - 1]);
    }


    var ctx = document.getElementById('dailyCasesChart');
    var myLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [
            {
                'label': 'مصابون أحياء (مرضى أو تعافوا)',
                'backgroundColor': 'rgb(0, 150, 255, 0.4)',
                'borderColor': 'rgb(0, 150, 255)',
                data: dailyOpenCases
            },
            {
                'label': 'وفيات',
                'backgroundColor': 'rgb(187, 17, 0, 0.4)',
                'borderColor': 'rgb(187, 17, 0)',
                data: dailyDeaths
            }
            ],
            labels: casesData['dates'].slice(1)
        },
        options: {
            responsive: true,
            title: {
                text: 'حالات جديدة في البلاد',
                display: false,
                fontSize: 40,
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'عدد الحالات',
                        fontSize: 20
                    },
                }]
            }
        }
    });
}

function drawVsWorldCharts(casesData) {
    drawVsWorldTotalCasesChart(casesData);
    drawVsWorldNormalizedByPopulationChart(casesData);
    drawVsWorldNormalizedByBedsChart(casesData);
}

function drawVsWorldTotalCasesChart(casesData) {
    threshold = 100;
    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالة';
    var title = 'عدد الحالات الكلي';
    var elementId = 'vsWorldCasesChart';

    var normalize_func= (function(countryData) {
        return Array.from(countryData['confirmed']);
    });

    drawVsWorldChart(elementId, casesData, normalize_func, threshold, xlabel, title);
}

function drawVsWorldNormalizedByPopulationChart(casesData) {
    threshold = 10;
    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالات لكل مليون مواطن ';
    var title = 'عدد الحالات لكل مليون مواطن';
    var elementId = 'vsWorldPopulationChart';

    var normalize_func= (function(countryData) {
        var million = 1000000;
        return countryData['confirmed'].map(x => x * million / countryData['population']);
    });

    drawVsWorldChart(elementId, casesData, normalize_func, threshold, xlabel, title);
}

function drawVsWorldNormalizedByBedsChart(casesData) {
    threshold = 0.01;
    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالة لكل سرير ';
    var title = 'عدد الحالات لكل سرير';
    var elementId = 'vsWorldBedsChart';

    var normalize_func= (function(countryData) {
        var totalBeds = countryData['beds_per_thousand'] * countryData['population'] / 1000;
        return countryData['confirmed'].map(x => x / totalBeds);
    });

    drawVsWorldChart(elementId, casesData, normalize_func, threshold, xlabel, title);
}

function drawVsWorldChart(elementId, casesData, normalize_func, threshold, xlabel, title) {

    var getCountryData = (function(threshold, casesArr) {
        var firstIndex = casesArr.findIndex(function(val) {
            return val > threshold;
        });
        var relevantData = casesArr.slice(firstIndex);
        
        return relevantData;
    });

    var series_size = 0;
    var countriesData = {};
    for (country in casesData['countries']) {
        normalizedData = normalize_func(casesData['countries'][country]);
        countriesData[country] = getCountryData(threshold, normalizedData);
        if (countriesData[country].length > series_size) {
            series_size = countriesData[country].length;
        }
    }

    var daysSince = [...Array(series_size).keys()];

    var ctx = document.getElementById(elementId);

    var datasets = Object.keys(countriesData).map(k => {
        var item = {
        'label': casesData['countries'][k]['arabic_name'],
        'fill': false,
        'borderColor': countryNameToColor(k),
        'lineTension': 0.1,
        'borderWidth': (k == 'local' ? 6 : 2),
        'data': countriesData[k]
        };

        return item;
    });

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets,
            labels: daysSince
        },
        options: {
            responsive: true,
            title: {
                text: title,
                display: true,
                fontSize: 20,
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xlabel,
                        fontSize: 20
                    },
                }],
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
    
                    zoom: {
                        enabled: true,
                        mode: 'xy',
                    }
                }
            }
        }
    });
    
}

function countryNameToColor(str) {
    var hardcoded = {
        'local': 'rgb(0, 0, 0)',
        'Italy': 'rgb(235, 117, 101)',
        'Spain': 'rgb(235, 13, 15)',
        'Germany': 'rgb(111, 112, 235)',
        'Korea, South': 'rgb(54, 139, 235)',
        'Turkey': 'rgb(95, 235, 91)',
        'Japan': 'rgb(235, 114, 182)'
    };

    if (str in hardcoded) {
        return hardcoded[str];
    }
    
    var colorHash = new ColorHash({lightness: 0.5});
    return colorHash.hex(str);
}

function drawGrowthFactorChart(casesData) {
    var dailyCases = convertTotalCasesToDailyCases(casesData['countries']['local']['confirmed']);
    var growthFactorArr = []
    for (var i = 1; i < dailyCases.length; i++) {
        if (dailyCases[i - 1] == 0) {
            growthFactorArr[i - 1] = 1;
        } else {
            growthFactorArr[i - 1] = dailyCases[i] / dailyCases[i - 1];
        }
    }

    var criticalGrowthFactorArr = Array(growthFactorArr.length).fill(1);

    var ctx = document.getElementById('growthFactorChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'عامل النمو',
                'fill': false,
                'borderColor': 'rgb(0, 150, 255)',
                'lineTension': 0.1,
                data: growthFactorArr
            },
            {
                'label': 'عامل النمو الحرج',
                'fill': false,
                'borderColor':'rgb(187, 17, 0)',
                'lineTension': 0.1,
                'pointRadius': 0,
                'borderDash': [10, 5],
                data: criticalGrowthFactorArr
            }
            ],
            labels: casesData['dates'].slice(2)
        },
        options: {
            responsive: true,
            title: {
                text: 'عامل النمو',
                display: false,
                fontSize: 20,
            },
            scales: {
                xAxes: [{
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'عامل النمو',
                        fontSize: 20
                    },
                }]
            }
        }
    });

    var periodForMeanGrowthFactor = 7;
    var relevantGrowthFactors = growthFactorArr.slice(-periodForMeanGrowthFactor);
    relevantGrowthFactors = relevantGrowthFactors.filter(function(val) {
        return (val != 0) && (val != Infinity);
    });
    var meanGrowthFactor = geometricMean(relevantGrowthFactors);

    var div = document.getElementById('meanGrowthFactor');
    div.innerHTML = meanGrowthFactor.toFixed(1);

    if (meanGrowthFactor <= 1) {
        div.classList.add('colorGreen');
    } else {
        div.classList.add('colorRed');
    }
}

function displayDoublesIn(casesData) {
    var numCasesToConsider = 7;
    var recentConfirmedCases = casesData['countries']['local']['confirmed'].slice(-numCasesToConsider);
    var size = recentConfirmedCases.length;
    var first = recentConfirmedCases[0];
    var last = recentConfirmedCases[recentConfirmedCases.length - 1];
    var meanMultiplier = Math.pow(last / first, 1 / (size - 1));

    var daysToDouble = Math.log(2) / Math.log(meanMultiplier);

    var div = document.getElementById('daysToDouble');
    div.innerHTML = daysToDouble.toFixed(1);

    div = document.getElementById('currentCases');
    div.innerHTML = last;

    div = document.getElementById('nextWeekCases');
    div.innerHTML = (last * Math.pow(meanMultiplier, 7)).toFixed(0);
}

function convertTotalCasesToDailyCases(totalCasesArr) {
    daily = [];
    for (var i = 1; i < totalCasesArr.length; i++) {
        daily[i - 1] = totalCasesArr[i] - totalCasesArr[i - 1];
    }

    return daily;
}

function mean(arr) {
    if (arr.length == 0) {
        return 0;
    }

    var sum = arr.reduce((prev, curr) => prev + curr);
    return sum / arr.length;
}

function geometricMean(arr) {
    if (arr.length == 0) {
        return 0;
    }

    var prod = arr.reduce((prev, curr) => prev * curr);
    return Math.pow(prod, 1 / arr.length);
}
