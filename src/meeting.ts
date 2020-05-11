import * as fs from 'fs';
import * as electron from 'electron';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Swal from 'sweetalert2';

const SlimSelect = require('slim-select')

const con = electron.remote.getGlobal('console')

const ProgressBar = electron.remote.getGlobal('ProgressBar');

let NEscolido: String[] = []
let UltimoEscolido: string = ""

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

                    },
                    {

                        "name": "Deliveries",
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

const div_entregas: HTMLDivElement | null = document.querySelector("div#entregas")
const div_entregas2: HTMLDivElement | null = document.querySelector("div#d_en")

const bt_add: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll("button#bt_add")
const bt_add_entregas: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll("button#bt_en")

interface ObjTrello {

    Card_Id: string

    Descricao: string

    Impedida: boolean
    Impedimento: string

}

interface ObjDeliveries {

    Card_Id: string

    Descricao: string

    Status: string
    Impedimento: string

}

interface UsersConfig {

    name: String,
    id: String,

}

class Trello {

    key: string
    token: string

    constructor(key: string, token: string) {

        this.key = key;
        this.token = token;

    }

    GetTrello = async (id: string, name: string, team: string) => {

        let b = true

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

        const progressBar = new ProgressBar({
            text: 'Carregando tarefas de '+name+'...',
            detail: 'Espere...',
            title: 'Carregando...'
        });
          
        progressBar.on('completed', function() {
            console.log("get concluido")
            progressBar.detail = 'Carregado. Fechando...';
        })

        progressBar.on('aborted', function() {
            console.info(`get abortado`);
            Swal.fire('O trello não respondeu :(', 'Infelismente o sistema só funciona com o trello, tente novamente mais tarde', 'error')
        });

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

                                            let UsersSelect: String[] = []

                                            for (let idm in res[c].idMembers) {

                                                for (let u in configs[cf].teams[t].users) {

                                                    if (configs[cf].teams[t].users[u].id == res[c].idMembers[idm]) {

                                                        UsersSelect.push(configs[cf].teams[t].users[u].name)

                                                    }

                                                }

                                            }

                                            console.log(UsersSelect)
                                            console.log(Multis[Multis.length-1])

                                            Multis[Multis.length-1].multi.set(UsersSelect)
                            
                                            break;

                                        case "Done":

                                            continue;

                                        case "Blocked":

                                            AddNode(res[c].name, res[c].id, true, res[c].desc.replace("Impedimento:", ""));
                                            break;

                                        case "Deliveries":

                                            if (res[c].desc.includes("Impedimento:")) {

                                                AddNodeEntregas(res[c].name, res[c].id, true, res[c].desc.replace("Impedimento:", ""))

                                            }
                                            else {

                                                AddNodeEntregas(res[c].name, res[c].id, false)

                                            }

                                            break;

                                    }

                                }

                            }

                            setTimeout(() => {

                                progressBar.setCompleted();

                            }, 1000)

                        })
                        .catch(e => {

                            progressBar.close();
    
                            console.log(e)
    
                            b = false

                        })

                    }


                }


            }

        }

        return b

    }

    PostTrello = async (Todo: ObjTrello[], Doing: ObjTrello[], Blocked: ObjTrello[], Done: ObjTrello[], Deliveries: ObjDeliveries[]) => {

        console.log("post trello")

        let LTodo = ""
        let LDoing = ""
        let LDone = ""
        let LBlocked = ""
        let LDeliveries = ""

        let Users: UsersConfig[] = []

        for (let cf in configs) {

            for (let t in configs[cf].teams) {

                if (configs[cf].teams[t].name == select_team?.value) {

                    Users = configs[cf].teams[t].users

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

                        if (configs[cf].teams[t].trello.lists[l].name == "Deliveries") {

                            LDeliveries = configs[cf].teams[t].trello.lists[l].id

                        }

                    }

                }

            }

        }

        console.log("posting: "+JSON.stringify(Todo)+"\n\n"+JSON.stringify(Doing)+"\n\n"+JSON.stringify(Blocked)+"\n\n"+JSON.stringify(Done))
          
        const progressBar = new ProgressBar({
            text: 'Enviando tarefas para Trello...',
            detail: 'Espere...',
            title: 'Enviando...'
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

                let IdUsers = ""

                for (let m in Multis) {

                    if (Multis[m].id.replace("multiple_", "") == Todo[i].Card_Id) {

                        for (let u in Users) {

                            if (Multis[m].value.includes(Users[u].name)) {

                                if (IdUsers == "") {

                                    IdUsers += Users[u].id

                                }
                                else {

                                    IdUsers += ","+Users[u].id

                                }

                            }

                        }    

                    }

                }                

                console.log(IdUsers)

                await axios.put("https://api.trello.com/1/cards/"+Todo[i].Card_Id+"?idList="+LTodo+"&idMembers="+IdUsers+"&desc="+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    //alert("deu")

                })
                .catch(e => {

                    //alert("deu erro: "+e)
                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                    return false

                })

            }

        }

        if (Doing[0] != undefined) {

            for (let i in Doing) {

                console.log("posting Doing")
                progressBar.detail = "Enviando Doing"

                let IdUsers = ""

                for (let m in Multis) {

                    if (Multis[m].id.replace("multiple_", "") == Doing[i].Card_Id) {

                        for (let u in Users) {

                            if (Multis[m].value.includes(Users[u].name)) {

                                if (IdUsers == "") {

                                    IdUsers += Users[u].id

                                }
                                else {

                                    IdUsers += ","+Users[u].id

                                }

                            }

                        }    

                    }

                }

                await axios.put("https://api.trello.com/1/cards/"+Doing[i].Card_Id+"?idList="+LDoing+"&idMembers="+IdUsers+"&desc="+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                    return false

                })

            }

        }

        if (Blocked[0] != undefined) {

            for (let i in Blocked) {

                console.log("posting Blocked")
                progressBar.detail = "Enviando Blocked"

                let IdUsers = ""

                for (let m in Multis) {

                    if (Multis[m].id.replace("multiple_", "") == Blocked[i].Card_Id) {

                        for (let u in Users) {

                            if (Multis[m].value.includes(Users[u].name)) {

                                if (IdUsers == "") {

                                    IdUsers += Users[u].id

                                }
                                else {

                                    IdUsers += ","+Users[u].id

                                }

                            }

                        }    

                    }

                }

                await axios.put("https://api.trello.com/1/cards/"+Blocked[i].Card_Id+"?idList="+LBlocked+"&desc=Impedimento: "+Blocked[i].Impedimento+"&idMembers="+IdUsers+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                    return false

                })

            }

        }

        if (Done[0] != undefined) {

            for (let i in Done) {

                console.log("posting Done")
                progressBar.detail = "Enviando Done"

                let IdUsers = ""

                for (let m in Multis) {

                    if (Multis[m].id.replace("multiple_", "") == Done[i].Card_Id) {

                        for (let u in Users) {

                            if (Multis[m].value.includes(Users[u].name)) {

                                if (IdUsers == "") {

                                    IdUsers += Users[u].id

                                }
                                else {

                                    IdUsers += ","+Users[u].id

                                }

                            }

                        }    

                    }

                }

                await axios.put("https://api.trello.com/1/cards/"+Done[i].Card_Id+"?idList="+LDone+"&idMembers="+IdUsers+"&desc="+"&key="+this.key+"&token="+this.token)
                .then(r => {

                    // alert("deu")

                })
                .catch(e => {

                    progressBar.detail = "Um erro ocorreu: "+e
                    progressBar.close()

                    return false

                })

            }

        }

        

        progressBar.setCompleted();

        if (select_user != undefined && NEscolido.includes(select_user.value)) {

            NEscolido.splice(NEscolido.indexOf(select_user.value), 1)

        }

        return true

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

interface Multi {

    multi: any
    id: String,
    value: String[]

}

interface dataSelect {

    text: string | undefined,
    value: string | string[] |undefined,
    mandatory?: boolean

}

interface MultiChange {

    "id": "6956323", 
    "value": "value1", 
    "text": "Value 1", 
    "innerHTML": "Value 1", 
    "selected": true, 
    "disabled": false, 
    "placeholder": false, 
    "class": "", 
    "style": "", "data": {}, 
    "mandatory": false

}

let Multis: Multi[] = []

const GeraMulti = (id: string, data: dataSelect[]) => {

    const multi = new SlimSelect({
        
        select: "."+id,
        placeholder: "- Selecione ao menos 1 pessoa -",
        data: data,
        onChange: (e: MultiChange[]) => {PegaValorMulti(e, id)}
    
    }) 

    for (let d in data) {

        if (data[d].mandatory) {

            multi.set([data[d].value])

        }

    }

    Multis.push({id: id, multi: multi, value: multi.selected()})

}

const PegaValorMulti = (e: MultiChange[], id: string) => {

    let v: string[] = []

    for (let vl in e) {

        v.push(e[vl].value)

    }

    for (let m in Multis) {

        if (Multis[m].id == id) {

            Multis[m].value = v

        }

    }

}

const AddNode = (tarefa: string, id: string, impedida: boolean, impedimento?: string) => {

    let HTML = ""

    if (impedida) {

        HTML = `
    
            <div style="background-color: #22323f;" id="tf_`+id+`">

                <div style="background-color: #22323f; id="tf_`+id+`">

                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                        <textarea id="text_tarefa_`+id+`" name="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>`+tarefa+`</textarea>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_status_`+id+`" name="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                                <option value="Vou fazer hoje">Vou fazer hoje</option>
                                <option value="Não Vou fazer hoje">Não Vou fazer hoje</option>
                                <option value="Concluido">Concluido</option>
                                <option value="Impedido" selected>Impedido</option>

                            </select>

                            <textarea id="text_impedimento_`+id+`" name="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px;" placeholder="Expecifique o impedimento..." required>`+impedimento+`</textarea>

                            <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

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

                    <textarea id="text_tarefa_`+id+`" name="text_tarefa_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>`+tarefa+`</textarea>

                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                        <select id="select_status_`+id+`" name="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                            <option value="Vou fazer hoje" selected>Vou fazer hoje</option>
                            <option value="Não Vou fazer hoje">Não Vou fazer hoje</option>
                            <option value="Concluido">Concluido</option>
                            <option value="Impedido">Impedido</option>

                        </select>

                    </div>

                    <textarea id="text_impedimento_`+id+`" name="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>

                    <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

                </div>

            </div>

        `

    }

    div_tarefas2?.insertAdjacentHTML("beforeend", HTML)

    let data: dataSelect[] = [];

    data.push({text: select_user?.value, value: select_user?.value, mandatory: true})

    for (let o in select_user?.options) {

        if (o == "0" || o == "1") {

            continue

        }
        else {

            if (select_user?.options[parseInt(o)] == undefined) {

                break

            }
            else if (select_user?.options[parseInt(o)].value != select_user.value) {

                data.push({text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value})

            }

        }

    }

    GeraMulti("multiple_"+id, data)

    const select: HTMLSelectElement | null | undefined = div_tarefas2?.querySelector("select#select_status_"+id)
    const text_impedimento: HTMLTextAreaElement | null | undefined = div_tarefas2?.querySelector("textarea#text_impedimento_"+id)

    select?.addEventListener("change", (e) => {

        if (select.value == "Impedido") {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")
            text_impedimento?.setAttribute("required", "")

        }
        else {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")
            text_impedimento?.removeAttribute("required")

        }

    })

}

const AddNodeEntregas = (entrega: string, id: string, impedida: boolean, impedimento?: string) => {

    let HTML = ""

    if (impedida) {

        HTML = `
    
            <div style="background-color: #22323f;" id="tf_`+id+`">

                <div style="background-color: #22323f; id="tf_`+id+`">

                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">

                        <textarea id="text_entrega_`+id+`" name="text_entrega_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required>`+entrega+`</textarea>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_status_`+id+`" name="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                                <option selected>Fazendo</option>
                                <option>Não entrege</option>
                                <option>Concluido</option>
                                <option>Impedido</option>

                            </select>

                            <textarea id="text_impedimento_`+id+`" name="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px;" placeholder="Expecifique o impedimento..." required>`+impedimento+`</textarea>

                            <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

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

                    <textarea id="text_entrega_`+id+`" name="text_entrega_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required>`+entrega+`</textarea>

                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                        <select id="select_status_`+id+`" name="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">

                            <option selected>Fazendo</option>
                            <option>Não entrege</option>
                            <option>Concluido</option>
                            <option>Impedido</option>

                        </select>

                    </div>

                    <textarea id="text_impedimento_`+id+`" name="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>

                    <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

                </div>

            </div>

        `

    }

    div_entregas2?.insertAdjacentHTML("beforeend", HTML)

    let data: dataSelect[] = [];

    data.push({text: select_user?.value, value: select_user?.value, mandatory: true})

    for (let o in select_user?.options) {

        if (o == "0" || o == "1") {

            continue

        }
        else {

            if (select_user?.options[parseInt(o)] == undefined) {

                break

            }
            else if (select_user?.options[parseInt(o)].value != select_user.value) {

                data.push({text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value})

            }

        }

    }

    GeraMulti("multiple_"+id, data)

    const select: HTMLSelectElement | null | undefined = div_entregas2?.querySelector("select#select_status_"+id)
    const text_impedimento: HTMLTextAreaElement | null | undefined = div_entregas2?.querySelector("textarea#text_impedimento_"+id)

    select?.addEventListener("change", (e) => {

        if (select.value == "Impedido") {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")
            text_impedimento?.setAttribute("required", "")

        }
        else {

            text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")
            text_impedimento?.removeAttribute("required")

        }

    })

}

const change_user = async () => {

    const User = select_user?.value
    const Team = select_team?.value

    Multis = []

    if (div_tarefas2 != undefined) {

        for (let i = div_tarefas2?.children.length || 0; i >= 1; i--) {

            div_tarefas2?.removeChild(div_tarefas2.children[i-1])

        }

    }

    if (select_user?.value != "") {

        let b = false

        let ops: string[] = []

        if (select_user?.value == "Random") {

            for (let o in select_user?.options) {

                if (select_user?.options[parseInt(o)] != undefined && parseInt(o) > 1) {

                    ops.push(select_user?.options[parseInt(o)].value)

                }

            }

            let sel = ops[Math.floor(Math.random() * NEscolido.length)]

            if (sel == UltimoEscolido) {

                if (ops.indexOf(sel) == ops.length-1) {

                    sel = ops[ops.indexOf(sel)-1]

                }
                else {

                    sel = ops[ops.indexOf(sel)+1]

                }

            }

            console.log(sel)

            select_user.value = sel

            console.log("NEscolido: ", NEscolido)

            change_user()

        }
        else {

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

                                b = await tr.GetTrello(configs[cf].teams[t].users[u].id, User, Team)

                                break

                            }

                        }

                    }

                }
            }

        }

        if (b) {

            div_tarefas?.setAttribute("style", "display: block")
            div_entregas?.setAttribute("style", "display: block")
        
        }
        else {

            div_tarefas?.setAttribute("style", "display: none")
            div_entregas?.setAttribute("style", "display: block")

        }

    }
    else {

        div_tarefas?.setAttribute("style", "display: none")

    }

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
    
                            <option selected>Fazendo</option>
                            <option>Concluido</option>
                            <option>Impedido</option>
    
                        </select>
    
                        <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>
    
                        <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

                    </div>
    
                </div>
    
            </div>
    
        `
    
        div_tarefas2?.insertAdjacentHTML("beforeend", HTML)
    
        let data: dataSelect[] = [];

        data.push({text: select_user?.value, value: select_user?.value, mandatory: true})
    
        for (let o in select_user?.options) {
    
            if (o == "0" || o == "1") {
    
                continue
    
            }
            else {
    
                if (select_user?.options[parseInt(o)] == undefined) {
    
                    break
    
                }
                else if (select_user?.options[parseInt(o)].value != select_user.value) {
    
                    data.push({text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value})
    
                }
    
            }
    
        }

        GeraMulti("multiple_"+id, data)

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

bt_add_entregas?.forEach(b => {

    b.addEventListener('click', (e) => {

        div_entregas?.setAttribute("style", "display: block")
    
        const id = uuidv4() 
    
        let HTML = `
        
            <div style="background-color: #22323f;" id="tf_`+id+`">
    
                <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+id+`">
    
                    <textarea id="text_entrega_`+id+`" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required></textarea>
    
                    <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">
    
                        <select id="select_status_`+id+`" style="color: white; background-color: #2b3f4e;">
    
                            <option selected>Fazendo</option>
                            <option>Não entrege</option>
                            <option>Concluido</option>
                            <option>Impedido</option>
    
                        </select>
    
                        <textarea id="text_impedimento_`+id+`" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>
    
                        <select id="multiple_`+id+`" class="multiple_`+id+`" name="multiple_`+id+`" multiple></select>

                    </div>
    
                </div>
    
            </div>
    
        `
    
        div_entregas2?.insertAdjacentHTML("beforeend", HTML)
    
        let data: dataSelect[] = [];

        data.push({text: select_user?.value, value: select_user?.value, mandatory: true})
    
        for (let o in select_user?.options) {
    
            if (o == "0" || o == "1") {
    
                continue
    
            }
            else {
    
                if (select_user?.options[parseInt(o)] == undefined) {
    
                    break
    
                }
                else if (select_user?.options[parseInt(o)].value != select_user.value) {
    
                    data.push({text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value})
    
                }
    
            }
    
        }

        GeraMulti("multiple_"+id, data)

        const select: HTMLSelectElement | null | undefined = div_entregas2?.querySelector("select#select_status_"+id)
        const text_impedimento: HTMLTextAreaElement | null | undefined = div_entregas2?.querySelector("textarea#text_impedimento_"+id)
    
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

select_user?.addEventListener('change', change_user)

select_team?.addEventListener('change', (e) => {

    let b = false

    ClearSelect("select_user")

    if (select_team.value != "") {

        const op = document.createElement("option")
        const op2 = document.createElement("option")

        op.value = ""
        op.text = "- Selecione uma pessoa -"

        op2.value = "Random"
        op2.text = "- Selecionar random -"

        select_user?.append(op)
        select_user?.append(op2)

        for (let config in configs) {

            for (let team in configs[config].teams) {

                if (configs[config].teams[team].name == select_team.value) {

                    for (let user in configs[config].teams[team].users) {

                        AddToSelect("select_user", configs[config].teams[team].users[user].name)

                        NEscolido.push(configs[config].teams[team].users[user].name)

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