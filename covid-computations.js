function getProcessAndPresentData(present_func) {
    // load data
    var confirmedCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
    var deathsCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
    var recoveredCsvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';

    var csvData = {'confirmed': null, 'deaths': null, 'recovered': null};

    getCasesCsvUrl(confirmedCsvUrl, 'confirmed', csvData, present_func);
    getCasesCsvUrl(deathsCsvUrl   , 'deaths'   , csvData, present_func);
    getCasesCsvUrl(recoveredCsvUrl, 'recovered', csvData, present_func);
}

function getCasesCsvUrl(url, key, data, present_func) {
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            data[key] = results.data;

            analyzeData(data, present_func);

        }
    })
}

function analyzeData(csvData, present_func) {
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

    present_func(casesData); 

}

function extractCasesData(csvData, casesData) {

    var hardcoded = {
                     'local': {
                         'confirmed': {
                             'startDate': '1/22/20',
                             'data': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,2,2,3,7,7,10,12,12,15,17,21,25,39,50,75,97,109,143,193,213,298,337,433,677,705,883,1071,1442,1930,2369,2693,3035,3619,4247,4695],
                         },
                         'recovered': {
                             'startDate': '1/22/20',
                             'data': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,3,3,4,4,4,4,4,4,4,4,11,11,14,15,36,37,41,53,58,68,79,89,132,161],
                         },
                         'deaths': {
                             'startDate': '1/22/20',
                             'data': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,3,5,8,12,12,15,16]
                         }
                     }
    };

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
                    var date = key;
                    var hardcodedIdx = NaN;
                    if ((country in hardcoded) && (caseType in hardcoded[country])) { //ugly work around for inaccuracies in JHU's data
                        var startDateMoment = moment(hardcoded[country][caseType]['startDate'], 'M/D/YY', true);
                        var thisDateMoment = moment(date, 'M/D/YY', true);
                        var diff = thisDateMoment.diff(startDateMoment, 'days');
                        if ((diff >= 0) && (diff < hardcoded[country][caseType]['data'].length)) {
                            hardcodedIdx = diff;
                        }
                    }

                    if (!isNaN(hardcodedIdx)) {
                        casesData['countries'][country][caseType].push(hardcoded[country][caseType]['data'][hardcodedIdx]);
                    } else {
                        casesData['countries'][country][caseType].push(parseInt(myData[0][date]));
                    }
                    if (extractDates) {
                        casesData['dates'].push(date);
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
        growthFactorArr[i - 1] = (dailyCases[casesType][i] + 0.1) / (dailyCases[casesType][i - 1] + 0.1); //add 1 to both to avoid 0 and Infinity
    }

    var meanGrowthFactorArr = [];

    for (var i = 0; i < growthFactorArr.length - periodToAverage + 1; i++) {
        var relevantGrowthFactors = growthFactorArr.slice(i, i + periodToAverage);
        meanGrowthFactorArr.push(geometricMean(relevantGrowthFactors));
    }

    var meanGrowthFactor = meanGrowthFactorArr[meanGrowthFactorArr.length - 1];

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
            'meanGrowthFactorArr': meanGrowthFactorArr,
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

function computeDeathRatio(casesData, country, daysBack) {
    var cases = casesData['countries'][country];
    var deaths = cases['deaths'][cases['deaths'].length - 1];
    var confirmed = cases['confirmed'][cases['confirmed'].length - 1 - daysBack];
    var ratio =  deaths / confirmed;
    return ratio;
}
