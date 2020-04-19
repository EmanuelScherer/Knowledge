import * as fs from 'fs'
import * as electron from 'electron'

const con = electron.remote.getGlobal('console')

const AddToSelect = (id: string, option: string, group?: string) => {

    if (group == undefined) {

        const select_team = document.getElementById(id)

        const op = document.createElement("option");

        op.value = option
        op.text = option

        select_team?.append(op)

    }
    else {

        const select_team = document.getElementById(id)

        let gr = document.getElementById(group)

        if (gr != undefined) {

            const op = document.createElement("option");

            op.value = option
            op.text = option

            gr.append(op)

        }
        else {

            gr = document.createElement("optgroup")
            gr.setAttribute("label", group)
            gr.setAttribute("id", group)

            const op = document.createElement("option");

            op.value = option
            op.text = option

            gr.append(op)

            select_team?.append(gr)

        }

    }

}

const configs = fs.readdirSync("./configs")

for (let file in configs) {

    const config = JSON.parse(fs.readFileSync("./configs/"+configs[file], "utf8"))

    for (let t in config.teams) {

        AddToSelect("select_team", config.teams[t].name, config.area)

    }

}

const from_team = document.getElementById("form_team")

from_team?.addEventListener('submit', (e) => {

    const a: HTMLSelectElement | null = document.querySelector("select#select_team")

    con.log(a?.value)

    e.preventDefault()

})