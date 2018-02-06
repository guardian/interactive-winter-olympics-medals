import fs from 'fs'
import moment from 'moment'

export default class Logger {


    static log (level, message) {
        if(level === 'error') {
            fs.appendFileSync('error.log', `${moment().format('MMMM Do YYYY, h:mm:ss a')}: ${message}\n`)
        } else {
            fs.appendFileSync('info.log', `${moment().format('MMMM Do YYYY, h:mm:ss a')}: ${message}\n`)
        }
    }

    static setLastUpdate() {
        fs.writeFileSync('last_updated.log', `${moment().format('MMMM Do YYYY, h:mm:ss a')}\n`)
    }

    static setLastRender() {
        fs.writeFileSync('last_rendered.log', `${moment().format('MMMM Do YYYY, h:mm:ss a')}\n`)
    }


}