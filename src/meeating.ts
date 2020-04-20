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

const ClearSelect = (id: string) => {

    const select: HTMLSelectElement | null = document.querySelector("select#"+id)

    for (let opt in select?.options) {

        select?.options.remove(parseInt(opt))

    }

}

const configsInDir = fs.readdirSync("./configs")

interface OConfig {

    "name": string,

    "area": string,

    "login": {

        "email": string,
        "senha": string

    },

    "teams": [

        {

            "name": string,
            
            "users" : [
                
                {
                    
                    "name": string
            
                    "id": string

                }

            ]

        }

    ]

}

let config: OConfig

let configs: OConfig[] = []

for (let file in configsInDir) {

    config = JSON.parse(fs.readFileSync("./configs/"+configsInDir[file], "utf8"))

    configs.push(config)

    for (let t in config.teams) {

        AddToSelect("select_team", config.teams[t].name, config.name+" > "+config.area)

    }

}

const from_team: HTMLFormElement | null = document.querySelector("select#form_team")
const select_team: HTMLSelectElement | null = document.querySelector("#select_team")
const div_2: HTMLElement | null = document.getElementById("2")

const select_user: HTMLSelectElement | null = document.querySelector("#select_user")

select_team?.addEventListener('change', (e) => {

    let b = false

    ClearSelect("select_user")

    if (select_team.value != "") {

        const op = document.createElement("option")

        op.value = ""
        op.text = "- Selecione uma pessoa -"

        select_user?.append(op)

        for (let config in configs) {

            for (let team in configs[config].teams) {

                if (configs[config].teams[team].name == select_team.value) {

                    for (let user in configs[config].teams[team].users) {

                        AddToSelect("select_user", configs[config].teams[team].users[user].name)

                    }

                    b = true
                    break

                }

            }

            if (b) {

                break

            }

        }

        div_2?.setAttribute("style", "display: block;")

    }
    else {

        div_2?.setAttribute("style", "display: none;")

    }

})

from_team?.addEventListener('submit', (e) => {

    const a: HTMLSelectElement | null = document.querySelector("select#select_team")

    con.log(a?.value)

    e.preventDefault()

})