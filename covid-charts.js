window.addEventListener('load', function() {
    getProcessAndPresentData(presentCovidCharts);
})

function presentCovidCharts(casesData) {
    drawTotalCasesChart(casesData);
    drawDailyCasesChart(casesData);
    drawGrowthFactorChart(casesData);

    drawVsWorldCharts(casesData);

    displayNumbers(casesData);
}

function drawTotalCasesChart(casesData) {
    var ctx = document.getElementById('total_cases_chart');
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
                    ticks: {
                        fontSize: 16,
                    }
                }],
                yAxes: [{
                    fontSize: 20,
                    scaleLabel: {
                        display: true,
                        labelString: 'عدد الحالات',
                        fontSize: 20
                    },
                    ticks: {
                        fontSize: 16,
                    }
                }]
            },
            legend: {
                labels: {
                    fontSize: 20
                }
            }
        }
    });
}

function drawDailyCasesChart(casesData) {

    var dailyData = computeDailyCasesData(casesData, 'local');


    var ctx = document.getElementById('daily_cases_chart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'إصابات',
                'fill': false,
                'lineTension': 0.1,
                'borderColor': 'rgb(0, 150, 255)',
                data: dailyData['confirmed']
            },
            {
                'label': 'وفيات',
                'fill': false,
                'lineTension': 0.1,
                'borderColor': 'rgb(187, 17, 0)',
                data: dailyData['deaths']
            },
            {
                'label': 'حالات شفاء',
                'fill': false,
                'lineTension': 0.1,
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
                    ticks: {
                        fontSize: 16,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'عدد الحالات',
                        fontSize: 20
                    },
                    ticks: {
                        fontSize: 16,
                    }
                }]
            },
            legend: {
                labels: {
                    fontSize: 20
                }
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
    var elementId = 'vs_world_cases_chart';

    drawVsWorldChart(elementId, casesData, worldData, xlabel, title);
}

function drawVsWorldNormalizedByPopulationChart(casesData) {
    threshold = 10;
    var worldData = computeWorldPopulationData(casesData, threshold);

    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالات لكل مليون مواطن ';
    var title = 'عدد الحالات لكل مليون مواطن';
    var elementId = 'vs_world_population_chart';

    drawVsWorldChart(elementId, casesData, worldData, xlabel, title);
}

function drawVsWorldNormalizedByBedsChart(casesData) {
    threshold = 0.01;
    var worldData = computeWorldBedsData(casesData, threshold);

    var xlabel = ' أيام مرت منذ كانت هناك ' + threshold + ' حالة لكل سرير ';
    var title = 'عدد الحالات لكل سرير';
    var elementId = 'vs_world_beds_chart';

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
                fontSize: 30,
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xlabel,
                        fontSize: 20
                    },
                    ticks: {
                        fontSize: 16,
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontSize: 16,
                    }
                }]
            },
            legend: {
                labels: {
                    fontSize: 20
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

    var meanGrowthFactorArr = Array(growthData['growthFactorDataDates'].length - growthData['meanGrowthFactorArr'].length).fill(0);
    meanGrowthFactorArr = meanGrowthFactorArr.concat(growthData['meanGrowthFactorArr']);

    var ctx = document.getElementById('growth_factor_chart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                'label': 'عامل النمو',
                'fill': false,
                'borderColor': 'rgb(255, 205, 0)',
                'lineTension': 0.1,
                hidden: true,
                data: growthData['growthFactorData']
            },
            {
                'label': 'عامل النمو المتوسط',
                'fill': false,
                'borderColor': 'rgb(0, 150, 255)',
                'lineTension': 0.1,
                data: meanGrowthFactorArr
            },
            {
                'label': 'عامل النمو الحرج',
                'fill': true,
                'backgroundColor': 'rgb(39, 235, 75, 0.1)',
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
                    ticks: {
                        fontSize: 16,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'عامل النمو',
                        fontSize: 20
                    },
                    ticks: {
                        fontSize: 16,
                        max: 3,
                    }
                }]
            },
            legend: {
                labels: {
                    fontSize: 20
                }
            }
        }
    });

    var meanGrowthFactor = growthData['meanGrowthFactor'];

    var div = document.getElementById('mean_growth_factor');
    div.innerHTML = meanGrowthFactor.toFixed(2);

    if (meanGrowthFactor <= 1) {
        div.classList.add('color_green');
    } else {
        div.classList.add('color_red');
    }
}

function displayNumbers(casesData) {
    var numCasesToConsider = 7;

    // regular cases
    var growthData = computeGrowthData(casesData, 'local', 'confirmed', numCasesToConsider);

    var div = document.getElementById('days_to_double_cases');
    div.innerHTML = growthData['daysToDouble'].toFixed(1);

    var cases = casesData['countries']['local']['confirmed'];
    div = document.getElementById('current_cases');
    div.innerHTML = cases[cases.length - 1];

    div = document.getElementById('next_week_cases');
    div.innerHTML = growthData['nextPeriodCases'].toFixed(0);

    // deaths
    var deathsGrowthData = computeGrowthData(casesData, 'local', 'deaths', numCasesToConsider);

    var div = document.getElementById('days_to_double_deaths');
    div.innerHTML = deathsGrowthData['daysToDouble'].toFixed(1);

    var deaths = casesData['countries']['local']['deaths'];
    div = document.getElementById('current_deaths');
    div.innerHTML = deaths[deaths.length - 1];

    div = document.getElementById('next_week_deaths');
    div.innerHTML = deathsGrowthData['nextPeriodCases'].toFixed(0);

    var daysBackForDeathRatio = 7;
    var death_ratio = computeDeathRatio(casesData, 'local', daysBackForDeathRatio);
    
    div = document.getElementById('death_percentage');
    div.innerHTML = (death_ratio * 100).toFixed(1) + '%';
}
