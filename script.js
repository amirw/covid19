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

            drawCasesChart();
        }
    })
}

function isRelevantDataKey(key) {
    var startDate = moment("2/21/20", "M/D/YY", true);
    var thisDate = moment(key, "M/D/YY", true);
    var isDate = thisDate.isValid();
    var isAfterStartDate = thisDate.isSameOrAfter(startDate);
    return isDate && isAfterStartDate;
}

// cases Chart
function drawCasesChart() {
    if ((dateLabelsArr.length == 0) || (confirmedCasesArr.length == 0) || (deathsCsvUrl.length == 0) || (recoveredCsvUrl.length == 0)) {
        return;
    }

    var ctx = document.getElementById('casesChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
            {
                "label": "Confirmed Cases",
                "fill":false,
                "borderColor":"rgb(0, 150, 255)",
                "lineTension":0.1,
                data: confirmedCasesArr
            },
            {
                "label": "Deaths",
                "fill":false,
                "borderColor":"rgb(187, 17, 0)",
                "lineTension":0.1,
                data: deathCasesArr
            },
            {
                "label": "Recovered",
                "fill":false,
                "borderColor":"rgb(78, 143, 0)",
                "lineTension":0.1,
                data: recoveredCasesArr
            }
            ],
            labels: dateLabelsArr
        },
        options: {}
    });
}

