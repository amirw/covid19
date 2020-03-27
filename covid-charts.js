window.addEventListener('load', function() {
    getProcessAndPresentData(presentCovidCharts);
})

function presentCovidCharts(casesData) {
    drawTotalCasesChart(casesData);
    drawDailyCasesChart(casesData);
    drawGrowthFactorChart(casesData);

    drawVsWorldCharts(casesData);

    displayDoublesIn(casesData);
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
