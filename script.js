// load data
var confirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
Papa.parse(confirmedCsvUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results, file) {
        var dateLabelsArr = []
        var confirmedCasesArr = []
        var relevant = results.data.filter(function(row_data) {
            return ('Country/Region' in row_data) && (row_data['Country/Region'] == 'Israel')
        });
        relevant = relevant[0];

        var startDate = moment("2/21/20", "M/D/YY", true)

        for (var key in relevant) {
            var thisDate = moment(key, "M/D/YY", true)
            var isDate = thisDate.isValid();
            var isAfterStartDate = thisDate.isSameOrAfter(startDate);
            if (isDate && isAfterStartDate) {
                dateLabelsArr.push(key);
                confirmedCasesArr.push(parseInt(relevant[key]));
            }
        }

        drawCasesChart(dateLabelsArr, confirmedCasesArr);
    }
})

// cases Chart
function drawCasesChart(dateLabelsArr, confirmedCasesArr) {
    var ctx = document.getElementById('casesChart');
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                "label":"Confirmed Cases",
                "fill":false,
                "borderColor":"rgb(187, 17, 0)",
                "lineTension":0.1,
                data: confirmedCasesArr
            }],
            labels: dateLabelsArr
        },
        options: {}
    });
}

