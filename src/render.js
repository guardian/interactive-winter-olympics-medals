import templateHTML from "./src/templates/main.html!text"
import medalTableJson from "../src/assets/data/medalsTable.json"
import medalListJson from "../src/assets/data/medalsList.json"
import rp from "request-promise"
import Mustache from "mustache"

export async function render() {
    return Mustache.render(templateHTML, {
        "countries": medalTableJson,
        "medals": medalListJson.sort((a,b) => {
        	return (new Date(a.startDate[0].full) > new Date(b.startDate[0].full)) ? 1 : -1
        })
    });
}