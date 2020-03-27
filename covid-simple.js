window.addEventListener('load', function() {
    getProcessAndPresentData(presentCovidData);
})

function presentCovidData(casesData) {
    presentGeneralData(casesData);
    presentVsWorldData(casesData);
}

function presentGeneralData(casesData) {
    var periodForMeanGrowthFactor = 7;
    var growthData = computeGrowthData(casesData, 'local', 'confirmed', periodForMeanGrowthFactor);

    var cases = casesData['countries']['local'];

    var numActive = cases['active'][cases['active'].length - 1];

    var colorStatus;
    var textStatus;

    if (growthData['meanGrowthFactor'] >= 1) {
        colorStatus = 'color_red';
        textStatus = 'زفت مغلي';
    } else {
        colorStatus = 'color_green';

        if (numActive > 0) {
            textStatus = 'بتحسن';
        } else {
            textStatus = 'ممتاز';
        }
    }

    var div = document.getElementById('current_status');
    div.classList.add(colorStatus);
    div.innerHTML += textStatus;

    var colorGoOut;
    var textGoOut;

    if (numActive > 0) {
        colorGoOut = 'color_red';
        textGoOut = 'لع انظبّ!';
    } else {
        colorGoOut = 'color_green';
        textGoOut = 'اه بس تطوّلش!';
    }

    div = document.getElementById('can_go_outside');
    div.classList.add(colorGoOut);
    div.innerHTML += textGoOut;
}

function presentVsWorldData(casesData) {
    var threshold = 0.01;
    var worldData = computeWorldBedsData(casesData, threshold);

    presentVsWorldCountryData('Spain', 'vs_spain', worldData, casesData);
    presentVsWorldCountryData('Italy', 'vs_italy', worldData, casesData);
    presentVsWorldCountryData('US', 'vs_usa', worldData, casesData);
    presentVsWorldCountryData('Germany', 'vs_germany', worldData, casesData);
}

function presentVsWorldCountryData(country, elementId, worldData, casesData) {
    var localData = worldData['countriesData']['local'];
    var countryData = worldData['countriesData'][country];


    var color;
    var text;

    var localNow = localData[localData.length - 1];
    var countryNow = countryData[countryData.length - 1];

    if (localNow > countryNow) {
        text = 'هون أظرط';
        color = 'color_red';
    } else {
        text = 'هون أحسن';
        color = 'color_green';
        if ((localData.length - 1) in countryData) {
            var countryComparedToLocal = countryData[localData.length - 1];
        
            if (localNow > countryComparedToLocal) {
                text = 'هون أحسن، بس قريبا رح يكون أظرط';
                color = 'color_orange';
            }
        }
    }

    var div = document.getElementById(elementId);
    div.classList.add(color);
    div.innerHTML = text;
}