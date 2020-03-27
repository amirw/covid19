getProcessAndPresentData();

function getProcessAndPresentData() {
    // load data
    var confirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
    var deathsCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
    var recoveredCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
    
    var csvData = {'confirmed': null, 'deaths': null, 'recovered': null};
    
    getCasesCsvUrl(confirmedCsvUrl, 'confirmed', csvData, presentData);
    getCasesCsvUrl(deathsCsvUrl   , 'deaths'   , csvData, presentData);
    getCasesCsvUrl(recoveredCsvUrl, 'recovered', csvData, presentData);
}

function getCasesCsvUrl(url, key, data, present_function) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            data[key] = results.data;

            analyzeData(data, present_function);

        }
    })
}

function analyzeData(csvData, present_function) {
    if ((csvData['confirmed'] == null) || (csvData['deaths'] == null) || (csvData['recovered'] == null)) {
        return;
    }

    var casesData = {
                      'dates': [],
                      'countries':
                        {
                            'local':          {'arabic_name': 'البلاد',              'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 8618562 , 'beds_per_thousand': 3.02},
                            'Italy':          {'arabic_name': 'إيطاليا',            'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 60485231, 'beds_per_thousand': 3.18},
                            'Spain':          {'arabic_name': 'إسبانيا',            'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 46749991, 'beds_per_thousand': 2.97},
                            'Germany':        {'arabic_name': 'ألمانيا',            'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 83712702, 'beds_per_thousand': 8},
                            'Korea, South':   {'arabic_name': 'كوريا الجنوبية',     'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 51257511, 'beds_per_thousand': 12.27},
                            'Turkey':         {'arabic_name': 'تركيا',              'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 84093774, 'beds_per_thousand': 2.81},
                            'Japan':          {'arabic_name': 'اليابان',            'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 26578042, 'beds_per_thousand': 13.05},
                            'China':          {'arabic_name': 'الصين',              'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 1437858810, 'beds_per_thousand': 4.34},
                            'US':             {'arabic_name': 'الولايات المتحدة',    'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population': 330488824, 'beds_per_thousand': 2.77},
                            'United Kingdom': {'arabic_name': 'بريطانيا',            'confirmed': [], 'deaths': [], 'recovered': [], 'active': [], 'population':  67792706, 'beds_per_thousand': 2.54},

                        }
                    };

    extractCasesData(csvData, casesData);

     present_function(casesData); 

}

function presentData(casesData) {
    drawTotalCasesChart(casesData);
    drawDailyCasesChart(casesData);
    drawGrowthFactorChart(casesData);

    drawVsWorldCharts(casesData);

    displayDoublesIn(casesData);
}

function extractCasesData(csvData, casesData) {

    var extractDates = true;
    var caseTypes = ['confirmed', 'deaths', 'recovered'];

    for (var iCaseType = 0; iCaseType < caseTypes.length; iCaseType++) {
        var caseType = caseTypes[iCaseType];

        for (var country in casesData['countries']) {
            var myData = csvData[caseType].filter(function(rowData) {
                var countryCompare = (country == 'local') ? 'Israel' : country;
                return ('Country/Region' in rowData) && (rowData['Country/Region'] == countryCompare);
            });

            for (var key in myData[0]) {
                if (isRelevantDataKey(key)) {
                    casesData['countries'][country][caseType].push(parseInt(myData[0][key]));
                    if (extractDates) {
                        casesData['dates'].push(key);
                    }
                }
            }

            extractDates = false;

            /* handle multi state countries */
            for (var i = 1; i < myData.length; i++) {
                var itemIdx = 0;
                for (var key in myData[i]) {
                    if (isRelevantDataKey(key)) {
                        casesData['countries'][country][caseType][itemIdx] += parseInt(myData[i][key]);
                        itemIdx += 1;
                    }
                }
            }

        }
    }

    for (var country in casesData['countries']) {
        var cases = casesData['countries'][country];
        for (var i = 0; i < cases['confirmed'].length; i++) {
            if ((i in cases['deaths']) && (i in cases['recovered'])) {
                cases['active'].push(cases['confirmed'][i] - cases['deaths'][i] - cases['recovered'][i]);
            }
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

function computeDailyCasesData(casesData, country) {
    var dailyOpenCases = [];
    var dailyDeaths = [];
    var dailyRecovered = [];
    var dailyConfirmed = [];

    var cases = casesData['countries'][country];

    for (var i = 1; i < cases['confirmed'].length; i++) {
        dailyOpenCases.push(cases['active'][i] - cases['active'][i - 1]);
        dailyDeaths.push(cases['deaths'][i] - cases['deaths'][i - 1]);
        dailyRecovered.push(cases['recovered'][i] - cases['recovered'][i - 1]);
        dailyConfirmed.push(cases['confirmed'][i] - cases['confirmed'][i - 1]);
    }

    return {'active': dailyOpenCases,
            'deaths': dailyDeaths,
            'recovered': dailyRecovered,
            'confirmed': dailyConfirmed,
            'dates': casesData['dates'].slice(1)}

}

function computeGrowthData(casesData, country, casesType, periodToAverage) {
    var dailyCases = computeDailyCasesData(casesData, country);

    var growthFactorArr = []
    for (var i = 1; i < dailyCases[casesType].length; i++) {
        if (dailyCases[casesType][i - 1] == 0) {
            growthFactorArr[i - 1] = 1;
        } else {
            growthFactorArr[i - 1] = dailyCases[casesType][i] / dailyCases[casesType][i - 1];
        }
    }

    var relevantGrowthFactors = growthFactorArr.slice(-periodToAverage);

    relevantGrowthFactors = relevantGrowthFactors.filter(function(val) {
        return (val != 0) && (val != Infinity);
    });
    var meanGrowthFactor = geometricMean(relevantGrowthFactors);


    var recentCases = casesData['countries'][country][casesType].slice(-periodToAverage);
    var firstNonZero = recentCases.findIndex(x => (x > 0));

    var meanMultiplier = NaN;
    var daysToDouble = NaN;
    var nextPeriodCases = NaN;

    if (firstNonZero == -1) {
        meanMultiplier = 0;
        daysToDouble = Infinity;
        nextPeriodCases = 0;
    } else {
        recentCases = recentCases.slice(firstNonZero);
        var periodLength = recentCases.length;
        if (periodLength > 1) {
            var firstCases = recentCases[0];
            var lastCases = recentCases[periodLength - 1];
            meanMultiplier = Math.pow(lastCases / firstCases, 1 / (periodLength - 1));
            daysToDouble = Math.log(2) / Math.log(meanMultiplier);
            nextPeriodCases = lastCases * Math.pow(meanMultiplier, periodToAverage);
        }
    }



    return {'growthFactorData': growthFactorArr,
            'growthFactorDataDates': casesData['dates'].slice(2),
            'meanGrowthFactor': meanGrowthFactor,
            'meanMultipier': meanMultiplier,
            'daysToDouble': daysToDouble,
            'nextPeriodCases': nextPeriodCases};

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

function computeWorldTotalCasesData(casesData, threshold) {
    var normalize_func= (function(countryData) {
        return Array.from(countryData['confirmed']);
    });

    return computeWorldData(casesData, normalize_func, threshold);
}

function computeWorldPopulationData(casesData, threshold) {
    var normalize_func= (function(countryData) {
        var million = 1000000;
        return countryData['confirmed'].map(x => x * million / countryData['population']);
    });

    return computeWorldData(casesData, normalize_func, threshold);
}

function computeWorldBedsData(casesData, threshold) {
    var normalize_func= (function(countryData) {
        var totalBeds = countryData['beds_per_thousand'] * countryData['population'] / 1000;
        return countryData['confirmed'].map(x => x / totalBeds);
    });

    return computeWorldData(casesData, normalize_func, threshold);
}

function computeWorldData(casesData, normalize_func, threshold) {
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

    return {'countriesData': countriesData,
            'daysSince': daysSince};
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
            },
            {
                'label': 'حالات شفاء',
                'fill': false,
                'borderColor': 'rgb(39, 235, 75)',
                'lineTension': 0.1,
                data: casesData['countries']['local']['recovered']
            },
            {
                'label': 'حالات مستمرة',
                'fill': false,
                'borderColor': 'rgb(235, 154, 32)',
                'lineTension': 0.1,
                data: casesData['countries']['local']['active']
            },
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

    var dailyData = computeDailyCasesData(casesData, 'local');


    var ctx = document.getElementById('dailyCasesChart');
    var myLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [
            {
                'label': 'إصابات',
                'backgroundColor': 'rgb(0, 150, 255, 0.4)',
                'borderColor': 'rgb(0, 150, 255)',
                data: dailyData['active']
            },
            {
                'label': 'وفيات',
                'backgroundColor': 'rgb(187, 17, 0, 0.4)',
                'borderColor': 'rgb(187, 17, 0)',
                data: dailyData['deaths']
            },
            {
                'label': 'حالات شفاء',
                'backgroundColor': 'rgb(39, 235, 75, 0.4)',
                'borderColor': 'rgb(39, 235, 75)',
                data: dailyData['recovered']
            },
            ],
            labels: dailyData['dates']
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
    var worldData = computeWorldTotalCasesData(casesData, threshold);

    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالة';
    var title = 'عدد الحالات الكلي';
    var elementId = 'vsWorldCasesChart';

    drawVsWorldChart(elementId, casesData, worldData, xlabel, title);
}

function drawVsWorldNormalizedByPopulationChart(casesData) {
    threshold = 10;
    var worldData = computeWorldPopulationData(casesData, threshold);

    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالات لكل مليون مواطن ';
    var title = 'عدد الحالات لكل مليون مواطن';
    var elementId = 'vsWorldPopulationChart';

    drawVsWorldChart(elementId, casesData, worldData, xlabel, title);
}

function drawVsWorldNormalizedByBedsChart(casesData) {
    threshold = 0.01;
    var worldData = computeWorldBedsData(casesData, threshold);

    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالة لكل سرير ';
    var title = 'عدد الحالات لكل سرير';
    var elementId = 'vsWorldBedsChart';

    drawVsWorldChart(elementId, casesData, worldData, xlabel, title);
}

function drawVsWorldChart(elementId, casesData, worldData, xlabel, title) {

    var ctx = document.getElementById(elementId);

    var datasets = Object.keys(worldData['countriesData']).map(k => {
        var item = {
        'label': casesData['countries'][k]['arabic_name'],
        'fill': false,
        'borderColor': countryNameToColor(k),
        'lineTension': 0.1,
        'borderWidth': (k == 'local' ? 6 : 2),
        'data': worldData['countriesData'][k],
        'hidden': !isShowCountryOnLoad(k),
        };

        return item;
    });

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets,
            labels: worldData['daysSince']
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
                        enabled: false,
                        mode: 'xy'
                    },

                    zoom: {
                        enabled: false,
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
        'Japan': 'rgb(235, 114, 182)',
        'China': 'rgb(235, 11, 148)',
        'US': 'rgb(20, 235, 218)',
        'United Kingdom': 'rgb(165, 89, 83)',
    };

    if (str in hardcoded) {
        return hardcoded[str];
    }

    var colorHash = new ColorHash({lightness: 0.5});
    return colorHash.hex(str);
}

function isShowCountryOnLoad(countryName) {
    var show = ['local', 'Italy', 'Spain'];
    return show.includes(countryName);
}

function drawGrowthFactorChart(casesData) {

    var periodForMeanGrowthFactor = 7;
    var growthData = computeGrowthData(casesData, 'local', 'confirmed', periodForMeanGrowthFactor);

    var criticalGrowthFactorArr = Array(growthData['growthFactorDataDates'].length).fill(1);

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
                data: growthData['growthFactorData']
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
            labels: growthData['growthFactorDataDates']
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

    var meanGrowthFactor = growthData['meanGrowthFactor'];

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

    // regular cases
    var growthData = computeGrowthData(casesData, 'local', 'confirmed', numCasesToConsider);

    var div = document.getElementById('daysToDoubleCases');
    div.innerHTML = growthData['daysToDouble'].toFixed(1);

    var cases = casesData['countries']['local']['confirmed'];
    div = document.getElementById('currentCases');
    div.innerHTML = cases[cases.length - 1];

    div = document.getElementById('nextWeekCases');
    div.innerHTML = growthData['nextPeriodCases'].toFixed(0);

    // deaths
    var deathsGrowthData = computeGrowthData(casesData, 'local', 'deaths', numCasesToConsider);

    var div = document.getElementById('daysToDoubleDeaths');
    div.innerHTML = deathsGrowthData['daysToDouble'].toFixed(1);

    var deaths = casesData['countries']['local']['deaths'];
    div = document.getElementById('currentDeaths');
    div.innerHTML = deaths[deaths.length - 1];

    div = document.getElementById('nextWeekDeaths');
    div.innerHTML = deathsGrowthData['nextPeriodCases'].toFixed(0);
}

