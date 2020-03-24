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
                            'local': {'confirmed': [], 'deaths': []},
                            'Italy': {'confirmed': [], 'deaths': []},
                            'Spain': {'confirmed': [], 'deaths': []},
                            'Germany': {'confirmed': [], 'deaths': []},
                            'Korea, South': {'confirmed': [], 'deaths': []}
                        }
                    };

    extractCasesData(csvData, casesData);

    
    drawTotalCasesChart(casesData);
    drawDailyCasesChart(casesData);
    drawGrowthFactorChart(casesData);

    drawVsWorldChart(casesData);

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

function drawVsWorldChart(casesData) {
    var threshold = 100; //number of patients to start from

    var localFirstIndex = casesData['countries']['local']['confirmed'].findIndex(function(val) {
        return val >= threshold;
    });
    var localData = casesData['countries']['local']['confirmed'].slice(localFirstIndex);
    var series_size = localData.length;

    countriesData = {};
    for (country in casesData['countries']) {
        if (country != 'local') {
            countriesData[country] = getOtherCountryCases(threshold, casesData['countries'][country]['confirmed'], series_size);
        }
    }

    var daysSince = [...Array(series_size).keys()]

    var ctx = document.getElementById('vsWorldChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'البلاد',
                'fill': false,
                'borderColor': 'rgb(0, 0, 0)',
                'lineTension': 0.1,
                'borderWidth': 6,
                data: localData
            },
            {
                'label': 'إيطاليا',
                'fill': false,
                'borderColor':'rgb(72, 237, 10)',
                'lineTension': 0.1,
                data: countriesData['Italy']
            },
            {
                'label': 'إسبانيا',
                'fill': false,
                'borderColor':'rgb(187, 17, 0)',
                'lineTension': 0.1,
                data: countriesData['Spain']
            },
            {
                'label': 'ألمانيا',
                'fill': false,
                'borderColor':'rgb(235, 153, 48)',
                'lineTension': 0.1,
                data: countriesData['Germany']
            },
            {
                'label': 'كوريا الجنوبية',
                'fill': false,
                'borderColor':'rgb(40, 156, 235)',
                'lineTension': 0.1,
                data: countriesData['Korea, South']
            },
            ],
            labels: daysSince
        },
        options: {
            responsive: true,
            title: {
                text: 'مقارنة مع بلاد أخرى',
                display: false,
                fontSize: 20,
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: ' أيام مرت منذ كان هناك ' + threshold + ' حالة',
                        fontSize: 20
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'عدد الحالات الكلي',
                        fontSize: 20
                    },
                }]
            }
        }
    });
}


function getOtherCountryCases(threshold, casesArr, size) {
    var firstIndex = casesArr.findIndex(function(val) {
        return val > threshold;
    });
    var relevantData = casesArr.slice(firstIndex);
    relevantData = relevantData.slice(0, size);

    return relevantData;
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
