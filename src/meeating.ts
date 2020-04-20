import * as fs from 'fs'
import * as electron from 'electron'
import { v4 as uuidv4 } from 'uuid'

const con = electron.remote.getGlobal('console')

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

const configsInDir = fs.readdirSync("./configs")

const from_team: HTMLFormElement | null = document.querySelector("select#form_team")
const select_team: HTMLSelectElement | null = document.querySelector("#select_team")
const div_2: HTMLElement | null = document.getElementById("2")

const select_user: HTMLSelectElement | null = document.querySelector("#select_user")

const div_tarefas: HTMLDivElement | null = document.querySelector("div#tarefas")
const div_tarefas2: HTMLDivElement | null = document.querySelector("div#d_tf")

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

for (let file in configsInDir) {

    config = JSON.parse(fs.readFileSync("./configs/"+configsInDir[file], "utf8"))

    configs.push(config)

    for (let t in config.teams) {

        AddToSelect("select_team", config.teams[t].name, config.name+" > "+config.area)

    }

}

const AddNode = (tarefa: string, id: string, impedida: boolean, impedimento?: string) => {

    div_tarefas?.setAttribute("style", "display: block")

    let HTML = ""

    if (impedida) {

        HTML = `
    
            <div style="background-color: #22323f; id="tf">

                <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                    <textarea disabled id="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;">`+tarefa+`</textarea>

                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                        <select id="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                            <option>Vou fazer hoje</option>
                            <option>Não Vou fazer hoje</option>
                            <option>Concluido</option>
                            <option selected>Impedido</option>

                        </select>

                        <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px;" placeholder="Expecifique o impedimento..." required>`+impedimento+`</textarea>

                    </div>

                </div>

            </div>

        `

    }
    else {

        HTML = `
    
            <div style="background-color: #22323f; id="tf">

                <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                    <textarea id="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;">`+tarefa+`</textarea>

                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                        <select id="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                            <option selected>Vou fazer hoje</option>
                            <option>Não Vou fazer hoje</option>
                            <option>Concluido</option>
                            <option>Impedido</option>

                        </select>

                    </div>

                    <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..." required></textarea>

                </div>

            </div>

        `

    }

    console.log(div_tarefas2)

    div_tarefas2?.insertAdjacentHTML("beforeend", HTML)

    const select: HTMLSelectElement | null | undefined = div_tarefas2?.querySelector("select#select_status_"+id)
    const text_impedimento: HTMLTextAreaElement | null | undefined = div_tarefas2?.querySelector("textarea#text_impedimento_"+id)

    select?.addEventListener("change", (e) => {

        if (select.value == "Impedido") {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")

        }
        else {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")

        }

    })

}

select_user?.addEventListener('change', (e) => {

    for (let i = div_tarefas2?.children.length || 1; i > 1; i--) {

        div_tarefas2?.removeChild(div_tarefas2.children[i-1])

    }

    if (select_user.value != "") {

        AddNode("Tarefa1", uuidv4(), true, "Impedimento1")
        AddNode("Tarefa2", uuidv4(), true, "Impedimento2")
        AddNode("Tarefa3", uuidv4(), false)
        AddNode("Tarefa4", uuidv4(), false)
        AddNode("Tarefa5", uuidv4(), true, "Impedimento3")

    }
    else {

        div_tarefas?.setAttribute("style", "display: none")

    }

})

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