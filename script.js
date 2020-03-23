// load data
var confirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
var deathsCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
var recoveredCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';

var dateLabelsArr = [];
var confirmedCasesArr = [];
var deathCasesArr = [];
var recoveredCasesArr = [];
var confirmedCasesItalyArr = [];

parseCasesCsvUrl(confirmedCsvUrl, dateLabelsArr, confirmedCasesArr, confirmedCasesItalyArr);
parseCasesCsvUrl(deathsCsvUrl, null, deathCasesArr, null);
parseCasesCsvUrl(recoveredCsvUrl, null, recoveredCasesArr, null);

function parseCasesCsvUrl(url, labels, cases, italyCases) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            var myData = results.data.filter(function(rowData) {
                return ('Country/Region' in rowData) && (rowData['Country/Region'] == 'Israel')
            });
            myData = myData[0];

            for (var key in myData) {
                if (isRelevantDataKey(key)) {
                    cases.push(parseInt(myData[key]));
                    if (labels != null) {
                        labels.push(key);
                    }
                }
            }

            var italyData = results.data.filter(function(rowData) {
                return ('Country/Region' in rowData) && (rowData['Country/Region'] == 'Italy')
            });
            italyData= italyData[0];

            if (italyCases != null) {
                for (var key in italyData) {
                    if (isRelevantDataKey(key)) {
                        italyCases.push(parseInt(italyData[key]));
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

    drawTotalCasesChart();
    drawDailyCasesChart();
    drawGrowthFactorChart();

    drawVsItalyChart();
    displayDoublesIn();
}

function drawTotalCasesChart() {
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
                data: confirmedCasesArr
            },
            {
                'label': 'وفيات',
                'fill': false,
                'borderColor': 'rgb(187, 17, 0)',
                'lineTension': 0.1,
                data: deathCasesArr
            },
            {
                'label': 'معافون',
                'fill': false,
                'borderColor': 'rgb(78, 143, 0)',
                'lineTension': 0.1,
                data: recoveredCasesArr
            }
            ],
            labels: dateLabelsArr
        },
        options: {
            responsive: true,
            title: {
                text: 'مجمل الحالات',
                display: true,
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

function drawDailyCasesChart() {
    var totalOpenCases = []
    for (var i = 0; i < confirmedCasesArr.length; i++) {
        totalOpenCases.push(confirmedCasesArr[i] - deathCasesArr[i] - recoveredCasesArr[i]);
    }

    var dailyOpenCases = []
    var dailyDeaths = []
    var dailyRecoveries = []

    for (var i = 1; i < confirmedCasesArr.length; i++) {
        dailyOpenCases.push(totalOpenCases[i] - totalOpenCases[i - 1]);
        dailyDeaths.push(deathCasesArr[i] - deathCasesArr[i - 1]);
        dailyRecoveries.push(recoveredCasesArr[i] - recoveredCasesArr[i - 1]);
    }


    var ctx = document.getElementById('dailyCasesChart');
    var myLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [
            {
                'label': 'مصابون قيد المرض',
                'backgroundColor': 'rgb(0, 150, 255, 0.4)',
                'borderColor': 'rgb(0, 150, 255)',
                data: dailyOpenCases
            },
            {
                'label': 'وفيات',
                'backgroundColor': 'rgb(187, 17, 0, 0.4)',
                'borderColor': 'rgb(187, 17, 0)',
                data: dailyDeaths
            },
            {
                'label': 'معافون',
                'backgroundColor': 'rgb(78, 143, 0, 0.4)',
                'borderColor': 'rgb(78, 143, 0)',
                data: dailyRecoveries
            }
            ],
            labels: dateLabelsArr.slice(1)
        },
        options: {
            responsive: true,
            title: {
                text: 'حالات جديدة',
                display: true,
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

function drawVsItalyChart() {
    var threshold = 60;

    var localFirstIndex = confirmedCasesArr.findIndex(function(val) {
        return val >= threshold;
    });
    var localData = confirmedCasesArr.slice(localFirstIndex);

    var italyFirstIndex = confirmedCasesItalyArr.findIndex(function(val) {
        return val >= threshold;
    });
    var italyData = confirmedCasesItalyArr.slice(italyFirstIndex);
    italyData = italyData.slice(0, localData.length);

    var daysSince = [...Array(localData.length).keys()]

    var ctx = document.getElementById('vsItalyChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'البلاد',
                'fill': false,
                'borderColor': 'rgb(0, 150, 255)',
                'lineTension': 0.1,
                data: localData
            },
            {
                'label': 'إيطاليا',
                'fill': false,
                'borderColor':'rgb(187, 17, 0)',
                'lineTension': 0.1,
                data: italyData
            }
            ],
            labels: daysSince
        },
        options: {
            responsive: true,
            title: {
                text: 'مقارنة مع إيطاليا',
                display: true,
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
            labels: dateLabelsArr.slice(2)
        },
        options: {
            responsive: true,
            title: {
                text: 'عامل النمو',
                display: true,
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
}

function displayDoublesIn() {
    var numCasesToConsider = 7;
    var recentConfirmedCases = confirmedCasesArr.slice(-numCasesToConsider);
    var size = recentConfirmedCases.length;
    var first = recentConfirmedCases[0];
    var last = recentConfirmedCases[recentConfirmedCases.length - 1];
    var meanMultiplier = Math.pow(last / first, 1 / size);

    var daysToDouble = Math.log(2) / Math.log(meanMultiplier);

    var div = document.getElementById('daysToDouble');
    div.innerHTML = daysToDouble.toFixed(1);

    div = document.getElementById('daysToDoubleTitle');
    div.innerHTML = 'أيام حتى مضاعفة عدد الحالات'
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
