const tabletojson = require('tabletojson').Tabletojson;
const { parentPort } = require('worker_threads');
const statRepository = require('./statistic-repository');
const { logger } = require('./logger');

const CORONAVIRUS_LINK = 'https://www.worldometers.info/coronavirus/';

var previousResult = {};

statRepository.getLastStatistic((data) => {
    logger.info(data);
})

function compareResult(curRes) {
    var newData = [];
    logger.info(JSON.stringify(curRes));
    Object.keys(curRes).forEach((country) => {
        var curCountry = curRes[country];
        var prevCountry = previousResult[country] || {};

        if (calculateTotalCases(curCountry) > calculateTotalCases(prevCountry)) {
            newData.push(curCountry);
        }
    });

    return newData;
};

function calculateTotalCases(countryData) {
    var data = countryData['TotalCases'] || "-1";
    return +data;
}

setInterval(() => tabletojson.convertUrl(
    CORONAVIRUS_LINK,
    function(tablesAsJson) {

        var curRes = {
            "update": new Date(),
            "data": tablesAsJson[0].filter((data) => {
                return data['Country,Other'] === 'Ukraine' || data['Country,Other'] === 'Russia';
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
        logger.info('Checked');
        // fs.writeFileSync('./res.json', JSON.stringify(curRes));
    }
), 10000);