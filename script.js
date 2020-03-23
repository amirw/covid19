// load data
var confirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
var deathsCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
var recoveredCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';

var dateLabelsArr = [];
var confirmedCasesArr = [];
var deathCasesArr = [];
var recoveredCasesArr = [];

parseCasesCsvUrl(confirmedCsvUrl, dateLabelsArr, confirmedCasesArr);
parseCasesCsvUrl(deathsCsvUrl, null, deathCasesArr);
parseCasesCsvUrl(recoveredCsvUrl, null, recoveredCasesArr);

function parseCasesCsvUrl(url, labels, cases) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            var my_data = results.data.filter(function(row_data) {
                return ('Country/Region' in row_data) && (row_data['Country/Region'] == 'Israel')
            });
            my_data = my_data[0];

            for (var key in my_data) {
                if (isRelevantDataKey(key)) {
                    cases.push(parseInt(my_data[key]));
                    if (labels != null) {
                        labels.push(key);
                    }
                }
            }

            analyzeData();

        }
    })
}

function isRelevantDataKey(key) {
    var startDate = moment('2/20/20', 'M/D/YY', true);
    var thisDate = moment(key, 'M/D/YY', true);
    var isDate = thisDate.isValid();
    var isAfterStartDate = thisDate.isSameOrAfter(startDate);
    return isDate && isAfterStartDate;
}

// cases Chart
function analyzeData() {
    if ((dateLabelsArr.length == 0) || (confirmedCasesArr.length == 0) || (deathCasesArr.length == 0) || (recoveredCasesArr.length == 0)) {
        return;
    }

    drawCasesChart();
    drawGrowthFactorChart();
    displayDoublesIn();
}

function drawCasesChart() {

    var confirmed = [];
    var deaths = [];
    var recovered = [];
    var dateLabels = [];

    var ctx = document.getElementById('casesChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'Confirmed Cases',
                'fill':false,
                'borderColor':'rgb(0, 150, 255)',
                'lineTension':0.1,
                data: confirmedCasesArr
            },
            {
                'label': 'Deaths',
                'fill':false,
                'borderColor':'rgb(187, 17, 0)',
                'lineTension':0.1,
                data: deathCasesArr
            },
            {
                'label': 'Recovered',
                'fill':false,
                'borderColor':'rgb(78, 143, 0)',
                'lineTension':0.1,
                data: recoveredCasesArr
            }
            ],
            labels: dateLabelsArr
        },
        options: {}
    });
}

function drawGrowthFactorChart() {
    var dailyCases = convertTotalCasesToDailyCases(confirmedCasesArr);
    var growthFactorArr = []
    for (var i = 1; i < dailyCases.length; i++) {
        if (dailyCases[i - 1] == 0) {
            growthFactorArr[i - 1] = 1;
        } else {
            growthFactorArr[i - 1] = dailyCases[i] / dailyCases[i - 1];
        }
    }

    criticalGrowthFactorArr = Array(growthFactorArr.length).fill(1);

    var ctx = document.getElementById('growthFactorChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'Momentary Growth Factor',
                'fill': false,
                'borderColor': 'rgb(0, 150, 255)',
                'lineTension': 0.1,
                data: growthFactorArr
            },
            {
                'label': 'Critical Growth Factor',
                'fill': false,
                'borderColor':'rgb(187, 17, 0)',
                'lineTension': 0.1,
                'pointRadius': 0,
                'borderDash': [5, 15],
                data: criticalGrowthFactorArr
            }
            ],
            labels: dateLabelsArr.splice(2)
        },
        options: {}
    });
}

function displayDoublesIn() {
    numCasesToConsider = 7;
    recentConfirmedCases = confirmedCasesArr.slice(-numCasesToConsider);
    size = recentConfirmedCases.length;
    first = recentConfirmedCases[0];
    last = recentConfirmedCases[recentConfirmedCases.length - 1];
    meanMultiplier = Math.pow(last / first, 1 / size);

    daysToDouble = Math.log(2) / Math.log(meanMultiplier);

    div = document.getElementById('daysToDouble');
    div.innerHTML = daysToDouble.toFixed(1);
}

function convertTotalCasesToDailyCases(totalCasesArr) {
    daily = [];
    for (var i = 1; i < totalCasesArr.length; i++) {
        daily[i - 1] = totalCasesArr[i] - totalCasesArr[i - 1];
    }

    return daily;
}

function mean(arr) {
    var sum = arr.reduce((prev, curr) => prev += curr);
    return sum / arr.length;
}
