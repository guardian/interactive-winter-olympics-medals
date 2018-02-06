import async from 'async'
import _ from 'lodash'
import rp from 'request-promise'
import fs from 'fs'
import Sema from "async-sema"
import * as d3 from "d3"
import schedule from "../src/assets/data/schedule.json"


const season = 2014

const generateMedalsTable = async() => {

    const data = await safeApi("http://api.stats.com/v1/stats/oly/wntr_oly/medals/?season=${season}&accept=json&api_key=gmqfer9bzzufxr2w84v52xqt&sig=3d6c4719d61d8b23edcbba94904f93fc2fad921cd6e6486444b923d590063c5a", null)
    const medalsData = data === null ? {} : data.apiResults[0].league.medals

    fs.writeFileSync("./src/assets/data/medalsTable.json", JSON.stringify(medalsData));
}

const safeApi = (url, substitute = []) => {

    return new Promise((resolve, reject) => {

        rp({ uri : url, json : true })

            .then(resp => {

                if(resp.message && resp.message === 'Data not found') { 

                    console.log('Response seems to contain no data ...')
                    resolve(substitute)
                } else {
                    resolve(resp)
                }

            })
            .catch(err => {

                console.log('Error during request:', err.message)

                if(Number(err.statusCode) === 403) { // rate limit
                    reject(err)
                } else {
                    resolve(substitute)
                }

            })

    })

}

const generateFullMedalsList = async(disciplineCodes) => {
    const data = await loadData(disciplineCodes);
    const cleanedMedals = _.flatten(_.flatten(data.map(a => a.apiResults[0].league.medals)).map(b => b.medalEvents));

    cleanedMedals.map((m) => {
        const fullEvent = schedule.find(b => b.olympicEventId === m.olympicEvent.olympicEventId);
        if(fullEvent) {
            m.startDate = fullEvent.startDate;
        } else {
            console.log(m.olympicEvent);
        }
        return m;
    });

    const medalsNestedByDiscipline = d3.nest()
        .key(d => d.discipline.abbreviation)
        .entries(cleanedMedals);

    fs.writeFileSync("./src/assets/data/medalsList.json", JSON.stringify(cleanedMedals));
    fs.writeFileSync("./src/assets/data/medalsListByDiscipline.json", JSON.stringify(medalsNestedByDiscipline));
}


const loadData = (disciplineCodes) => {
    return new Promise((resolve, reject) => {
        async.map(disciplineCodes, async.asyncify(async(sport) => {
            await lim();
            console.log("medals:" + sport + " ...")
            const response = await safeApi(`http://api.stats.com/v1/stats/oly/wntr_oly/${sport}/medals/?season=${season}&accept=json&api_key=gmqfer9bzzufxr2w84v52xqt`, [])
            console.log("medals:" + sport + " ✓")
            return response;
        }), (err, results) => {
            if (err) {
                // need to do something real with errors here, retry?
                throw err;
            }
            resolve(results);
        })
    });
}

const rateLimit = (rps) => {
    const sema = new Sema(rps);

    return async function rl() {
        await sema.v();
        setTimeout(() => sema.p(), 1000);
    }
}

const lim = rateLimit(4);

const generateSchedule = async(disciplineCombinations) => {
    const data = await loadScheduleData(disciplineCombinations);

    const cleanedData = _.flatten(data.map(a => a.apiResults[0].league.season).map(b => _.flatten(b.eventType.map(c => c.events)).map(c => Object.assign({}, c, { "discipline": b.discipline })))).map((d) => {
        // just getting rid of results to shrink the json size
        delete d["olympicResults"];
        return d;
    });

    const sortedData = cleanedData.sort((a, b) => new Date(a.startDate[0].full) >= new Date(b.startDate[0].full) ? 1 : -1);

    fs.writeFileSync("./.build/assets/data/schedule.json", JSON.stringify(sortedData));
}

const loadScheduleData = (disciplineCombinations) => {
    return new Promise((resolve, reject) => {
        async.map(disciplineCombinations, async.asyncify(async(sportArr) => {
            await lim();
            console.log("schedule: " + sportArr[0] + " on " + sportArr[1] + " ...")
            const response = await safeApi(`http://api.stats.com/v1/stats/oly/wntr_oly/${sportArr[0]}/events/?season=${season}&date=${sportArr[1]}&api_key=gmqfer9bzzufxr2w84v52xqt`, [])
            console.log("schedule: " + sportArr[0] + " on " + sportArr[1] + " ✓")
            return response;
        }), (err, results) => {
            //if (err) throw err;

            console.log(err)

            resolve(results);
        })
    });
}

const generator = async() => {
    // get the list of disciplines and the days those disciplines have events
    const scheduleResp = await rp({uri: `http://api.stats.com/v1/stats/oly/wntr_oly/schedule/?season=${season}&accept=json&api_key=gmqfer9bzzufxr2w84v52xqt&sig=b340ae69d5e6ba22c7a9dc1e9afab79ba24c210c39544ff423f4e2036fea7a94`, json: true});
    const disciplineData = scheduleResp.apiResults[0].league.season.schedule[0].disciplines;

    const disciplineCodes = disciplineData.map(d => d.abbreviation);
    const disciplineCombinations = _.flatten(disciplineData.map(d => d.eventDates.map(e => [d.abbreviation, e.date.full])));

    await generateSchedule(disciplineCombinations);
    await generateMedalsTable();
    await generateFullMedalsList(disciplineCodes);
}

generator();