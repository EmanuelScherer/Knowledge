import * as fs from 'fs';
import * as electron from 'electron';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const con = electron.remote.getGlobal('console')

const ProgressBar = electron.remote.getGlobal('ProgressBar');

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
            
            "trello": {

                "board": "",
                
                "lists": [

                    {

                        "name": "To Do",
                        "id": ""

                    },
                    {

                        "name": "Doing",
                        "id": ""

                    },
                    {

                        "name": "Done",
                        "id": ""

                    },
                    {

                        "name": "Blocked",
                        "id": ""

                    }

                ]

            },

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

const from_team: HTMLFormElement | null = document.querySelector("form#form_team")
const select_team: HTMLSelectElement | null = document.querySelector("#select_team")
const div_2: HTMLElement | null = document.getElementById("2")

const select_user: HTMLSelectElement | null = document.querySelector("#select_user")

const div_tarefas: HTMLDivElement | null = document.querySelector("div#tarefas")
const div_tarefas2: HTMLDivElement | null = document.querySelector("div#d_tf")

const bt_add: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll("button#bt_add")

interface ObjTrello {

    Card_Id: string

    Descricao: string

    Impedida: boolean
    Impedimento: string

}

class Trello {

    key: string
    token: string

    constructor(key: string, token: string) {

        this.key = key;
        this.token = token;

    }

    GetTrello = async (id: string, name: string, team: string, ) => {

        interface ReturnList {
                
            "id": string,
            "checkItemStates": null | boolean,
            "closed": boolean,
            "dateLastActivity": string,
            "desc": "",
            "descData": null,
            "dueReminder": null,
            "idBoard": string,
            "idList": string,
            "idMembersVoted": [string | null],
            "idShort": number,
            "idAttachmentCover": null | string,
            "idLabels": [string | null],
            "manualCoverAttachment": boolean,
            "name": string,
            "pos": number,
            "shortLink": string,
            "isTemplate": boolean,
            "badges": {
                "attachmentsByType": {
                    "trello": {
                        "board": number,
                        "card": number
                    }
                },
                "location": boolean,
                "votes": number,
                "viewingMemberVoted": boolean,
                "subscribed": boolean,
                "fogbugz": string,
                "checkItems": number,
                "checkItemsChecked": number,
                "checkItemsEarliestDue": null,
                "comments": string[],
                "attachments": number,
                "description": boolean,
                "due": null,
                "dueComplete": boolean
            },
            "dueComplete": boolean,
            "due": null,
            "idChecklists": string[],
            "idMembers": [
                string
            ],
            "labels": string[],
            "shortUrl": string,
            "subscribed": boolean,
            "url": string,
            "cover": {
                "idAttachment": null | string,
                "color": null | string,
                "idUploadedBackground": null | string,
                "size": string,
                "brightness": string
            }

        }

        for (let cf in configs) {

            for (let t in configs[cf].teams) {

                if (configs[cf].teams[t].name == team) {

                    for (let l in configs[cf].teams[t].trello.lists) {

                        await axios.get("https://api.trello.com/1/lists/"+configs[cf].teams[t].trello.lists[l].id+"/cards?key="+this.key+"&token="+this.token)
                        .then(r => {

                            let res: ReturnList[] = r.data

                            for (let c in res) {

                                if (res[c].idMembers.includes(id)) {

                                    switch (configs[cf].teams[t].trello.lists[l].name) {
                                   
                                        case "To Do": case "Doing":

                                            AddNode(res[c].name, res[c].id, false);
                                            break;

                                        case "Done":

                                            continue;

                                        case "Blocked":

                                            AddNode(res[c].name, res[c].id, true, res[c].desc.replace("Impedimento:", ""));
                                            break;

                                    }

                                }

                            }

                        })

                    }


                }


            }

        }

    }

    PostTrello = async (Todo: ObjTrello[], Doing: ObjTrello[], Blocked: ObjTrello[], Done: ObjTrello[]) => {

        console.log("post trello")

        let LTodo = ""
        let LDoing = ""
        let LDone = ""
        let LBlocked = ""

        for (let cf in configs) {

            for (let t in configs[cf].teams) {

                if (configs[cf].teams[t].name == select_team?.value) {

                    for (let l in configs[cf].teams[t].trello.lists) {

                        if (configs[cf].teams[t].trello.lists[l].name == "To Do") {

                            LTodo = configs[cf].teams[t].trello.lists[l].id

                        }

                        if (configs[cf].teams[t].trello.lists[l].name == "Doing") {

                            LDoing = configs[cf].teams[t].trello.lists[l].id

                        }

                        if (configs[cf].teams[t].trello.lists[l].name == "Blocked") {

                            LBlocked = configs[cf].teams[t].trello.lists[l].id

                        }

                        if (configs[cf].teams[t].trello.lists[l].name == "Done") {

                            LDone = configs[cf].teams[t].trello.lists[l].id

                        }

                    }

                }

            }

        }

        console.log("posting: "+JSON.stringify(Todo)+"\n\n"+JSON.stringify(Doing)+"\n\n"+JSON.stringify(Blocked)+"\n\n"+JSON.stringify(Done))

        const progressBar = new ProgressBar({
            text: 'Enviando tarefas para Trello...',
            detail: 'Espere...'
        });
          
        progressBar.on('completed', function() {
            console.log("post concluido")
            progressBar.detail = 'Enviado. Fechando...';
        })

        progressBar.on('aborted', function() {
            console.info(`post abortado`);
        });
          
        if (Todo[0] != undefined) {

            for (let i in Todo) {

                console.log("posting Todo")
                progressBar.detail = "Enviando Todo"

                await axios.put("https://api.trello.com/1/cards/"+Todo[i].Card_Id+"?idList="+LTodo+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    //alert("deu")

                })
                .catch(e => {

                    //alert("deu erro: "+e)
                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                })

            }

        }

        if (Doing[0] != undefined) {

            for (let i in Doing) {

                console.log("posting Doing")
                progressBar.detail = "Enviando Doing"

                await axios.put("https://api.trello.com/1/cards/"+Doing[i].Card_Id+"?idList="+LDoing+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                })

            }

        }

        if (Blocked[0] != undefined) {

            for (let i in Blocked) {

                console.log("posting Blocked")
                progressBar.detail = "Enviando Blocked"

                await axios.put("https://api.trello.com/1/cards/"+Blocked[i].Card_Id+"?idList="+LBlocked+"&desc=Impedimento: "+Blocked[i].Impedimento+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                })

            }

        }

        if (Done[0] != undefined) {

            for (let i in Done) {

                console.log("posting Done")
                progressBar.detail = "Enviando Done"

                await axios.put("https://api.trello.com/1/cards/"+Done[i].Card_Id+"?idList="+LDone+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                })

            }

        }

        progressBar.setCompleted();

    }

}

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

    let HTML = ""

    if (impedida) {

        HTML = `
    
            <div style="background-color: #22323f;" id="tf_`+id+`">

                <div style="background-color: #22323f; id="tf_`+id+`">

                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                        <textarea id="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>`+tarefa+`</textarea>

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

            </div>

        `

    }
    else {

        HTML = `

            <div style="background-color: #22323f;" id="tf_`+id+`">
    
                <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                    <textarea id="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>`+tarefa+`</textarea>

                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                        <select id="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                            <option selected>Vou fazer hoje</option>
                            <option>Não Vou fazer hoje</option>
                            <option>Concluido</option>
                            <option>Impedido</option>

                        </select>

                    </div>

                    <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>

                </div>

            </div>

        `

    }

    div_tarefas2?.insertAdjacentHTML("beforeend", HTML)

    const select: HTMLSelectElement | null | undefined = div_tarefas2?.querySelector("select#select_status_"+id)
    const text_impedimento: HTMLTextAreaElement | null | undefined = div_tarefas2?.querySelector("textarea#text_impedimento_"+id)

    select?.addEventListener("change", (e) => {

        if (select.value == "Impedido") {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")
            text_impedimento?.setAttribute("required", "true")

        }
        else {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")
            text_impedimento?.setAttribute("required", "false")

        }

    })

}

bt_add?.forEach(b => {

    b.addEventListener('click', (e) => {

        div_tarefas?.setAttribute("style", "display: block")
    
        const id = uuidv4() 
    
        let HTML = `
        
            <div style="background-color: #22323f;" id="tf_`+id+`">
    
                <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">
    
                    <textarea id="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required></textarea>
    
                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">
    
                        <select id="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">
    
                            <option selected>Vou fazer hoje</option>
                            <option>Não Vou fazer hoje</option>
                            <option>Concluido</option>
                            <option>Impedido</option>
    
                        </select>
    
                        <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>
    
                    </div>
    
                </div>
    
            </div>
    
        `
    
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
    
    })

})

select_user?.addEventListener('change', async (e) => {

    const User = select_user.value
    const Team = select_team?.value

    if (div_tarefas2 != undefined) {

        for (let i = div_tarefas2?.children.length || 0; i >= 1; i--) {

            div_tarefas2?.removeChild(div_tarefas2.children[i-1])

        }

    }

    if (select_user.value != "") {

        div_tarefas?.setAttribute("style", "display: block")

        console.log("user mudado")

        const tr = new Trello("c8055ea81e83e2f2aee0a17139667194", "3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

        console.log(Team)

        for (let cf in configs) {

            for (let t in configs[cf].teams) {

                if (configs[cf].teams[t].name == Team) {

                    console.log("a")

                    for (let u in configs[cf].teams[t].users) {

                        if (configs[cf].teams[t].users[u].name == User) {

                            console.log("pega trello")

                            await tr.GetTrello(configs[cf].teams[t].users[u].id, User, Team)
                            break

                        }

                    }

                }

            }

        }


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

from_team?.addEventListener('submit', async (e) => {

    e.preventDefault()

    const tr = new Trello("c8055ea81e83e2f2aee0a17139667194", "3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

    const div_tf: HTMLDivElement | null = document.querySelector("div#d_tf")

    let Todo: ObjTrello[] = []
    let Doing: ObjTrello[] = []
    let Done: ObjTrello[] = []
    let Bloked: ObjTrello[] = []

    if (div_tf?.children.length != undefined) {

        for (let i = 0; i < div_tf?.children.length; i++) {

            const id = div_tf?.children[i].id.replace("tf_", "")

            const text: HTMLTextAreaElement | null = div_tf?.children[i].querySelector("textarea#text_tarefa_"+id)
            const select: HTMLSelectElement | null = div_tf?.children[i].querySelector("select#select_status_"+id)
            const imp: HTMLSelectElement | null = div_tf?.children[i].querySelector("textarea#text_impedimento_"+id)

            const desc = text?.value

            switch (select?.value) {

                case "Vou fazer hoje": {

                    Doing.push({Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: ""})
                    break

                }

                case "Não Vou fazer hoje": {

                    Todo.push({Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: ""})
                    break

                }

                case "Concluido": {

                    Done.push({Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: ""})
                    break

                }

                case "Impedido": {

                    Bloked.push({Card_Id: id, Descricao: desc || "", Impedida: true, Impedimento: imp?.value || ""})
                    break

                }

            }

        }

        await tr.PostTrello(Todo, Doing, Bloked, Done)

    }

})