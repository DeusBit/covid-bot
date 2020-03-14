const tabletojson = require('tabletojson').Tabletojson;
const { parentPort } = require('worker_threads');
const statRepository = require('./statistic-repository');
const { logger } = require('./logger');

const CORONAVIRUS_LINK = 'https://www.worldometers.info/coronavirus/';

var previousResult = {};

statRepository.getLastStatistic((data) => {
    // logger.info(data);
})

function compareResult(curRes) {
    var newData = [];
    Object.keys(curRes).forEach((country) => {
        var curCountry = curRes[country];
        var prevCountry = previousResult[country] || {};

        // check new cases or deaths
        if (isNewCases(curCountry, prevCountry) ||
            isNewDeaths(curCountry, prevCountry)) {
            newData.push(curCountry);
        }
    });

    return newData;
};

function isNewCases(curStat, prevStat) {
    return calculateTotalCases(curStat) > calculateTotalCases(prevStat);
}

function isNewDeaths(curStat, prevStat) {
    return calculateTotalDeaths(curStat) > calculateTotalDeaths(prevStat);
}

function calculateTotalCases(countryData) {
    var data = countryData['TotalCases'] || "0";
    return +data;
}

function calculateTotalDeaths(countryData) {
    var data = countryData['TotalDeaths'] || "0";
    return +data;
}

setInterval(() => tabletojson.convertUrl(
    CORONAVIRUS_LINK,
    function(tablesAsJson) {

        var curRes = {
            "update": new Date(),
            "data": tablesAsJson[0].filter((data) => {
                return data['Country,Other'] === 'Ukraine' || data['Country,Other'] === 'Italy';
            }).reduce((acc, cur) => {
                var key = cur["Country,Other"];
                acc[key] = cur;
                return acc;
            }, {})
        };
        statRepository.addStatistic(curRes);
        var newData = compareResult(curRes.data);
        previousResult = curRes.data;
        if (newData.length > 0) {
            parentPort.postMessage(newData);
        }
    }
), 10000);