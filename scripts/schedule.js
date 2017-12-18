import async from 'async'
import mapLimit from 'async/mapLimit'
import _ from 'lodash'
import rp from 'request-promise'
import fs from 'fs'
import * as d3 from "d3"

const sportAbbreviations = ["AS", "SJ", "SN", "SS"];

const cleanData = async() => {
    const data = await loadData();

    const cleanedData = _.flatten(data.map(a => a.apiResults[0].league.season).map(b => _.flatten(b.eventType.map(c => c.events)).map(c => Object.assign({}, c, { "discipline": b.discipline })))).map((d) => {
        // just getting rid of results to shrink the json size
        delete d["olympicResults"];
        return d;
    });

    const sortedData = cleanedData.sort((a, b) => new Date(a.startDate[0].full) >= new Date(b.startDate[0].full) ? 1 : -1);

    fs.writeFileSync("./src/assets/data/schedule.json", JSON.stringify(sortedData));
}

const loadData = () => {
    return new Promise((resolve, reject) => {
        mapLimit(sportAbbreviations, 1, async.asyncify(async(sport) => {
            const response = await rp({ "uri": `http://api.stats.com/v1/stats/oly/wntr_oly/${sport}/events/?api_key=gmqfer9bzzufxr2w84v52xqt`, "json": true });
            console.log(sport + " ✓")
            return response;
        }), (err, results) => {
            if (err) throw err;
            resolve(results);
        })
    });
}

cleanData();