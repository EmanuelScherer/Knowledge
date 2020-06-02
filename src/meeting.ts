import * as fs from 'fs';
import * as electron from 'electron';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosResponse } from 'axios';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import {Time, Login, User} from '../utils/tipos'

const login = electron.remote.getGlobal('login')

if (login == undefined || login == null || login == {}) {

    Swal.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
    .then(() => {

        electron.remote.getGlobal('win').loadFile('./html/login.html')

    })

}
else {

    const SlimSelect = require('slim-select')

    const con = electron.remote.getGlobal('console')

    const ProgressBar = electron.remote.getGlobal('ProgressBar');

    let team = ""
    let user = ""
    let idUser = ""
    let lists: { name: string, id: string }[] = []
    let idUsers: { name: string, id: string }[] = []

    let NEscolido: String[] = []
    let UltimoEscolido: string = ""

    let config: Login

    let configs: Login[] = []

    const configsInDir = fs.readdirSync(electron.remote.getGlobal('app').getAppPath()+"\\configs")

    const from_team: HTMLFormElement | null = document.querySelector("form#form_team")
    const select_team: HTMLSelectElement | null = document.querySelector("#select_team")
    const div_2: HTMLElement | null = document.getElementById("2")
    const div_3: HTMLElement | null = document.getElementById("3")

    const select_user: HTMLSelectElement | null = document.querySelector("#select_user")

    const div_tarefas: HTMLDivElement | null = document.querySelector("div#tarefas")
    const div_tarefas2: HTMLDivElement | null = document.querySelector("div#d_tf")

    const div_entregas: HTMLDivElement | null = document.querySelector("div#entregas")
    const div_entregas2: HTMLDivElement | null = document.querySelector("div#d_en")

    const bt_add: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll("a#bt_add")
    const bt_add_entregas: NodeListOf<HTMLButtonElement> | null = document.querySelectorAll("a#bt_en")

    const from_reset: HTMLFormElement | null = document.querySelector("form#form_reset")

    interface ObjTrello {

        Card_Id: string

        Descricao: string

        Impedida: boolean
        Impedimento: string

    }

    interface ObjDeliveries {

        Card_Id: string

        Descricao: string

        Dia: string

        Status: "fazendo" | "impedida" | "concluido" | "nao entregada"
        Impedimento: string

    }

    interface UsersConfig {

        name: String,
        id: String,

    }

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
        "due": string,
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

    class Trello {

        key: string
        token: string

        constructor(key: string, token: string) {

            this.key = key;
            this.token = token;

        }

        GetTrello = async (id: string, name: string, team: string) => {

            let b = true

            const progressBar = new ProgressBar({
                text: 'Carregando tarefas de ' + name + '...',
                detail: 'Espere...',
                title: 'Carregando...'
            });

            progressBar.on('completed', function () {
                console.log("get concluido")
                progressBar.detail = 'Carregado. Fechando...';
            })

            progressBar.on('aborted', function () {
                console.info(`get abortado`);
                Swal.fire('O trello não respondeu :(', 'Infelismente o sistema só funciona com o trello, tente novamente mais tarde', 'error')
            });

            for (let cf in configs) {

                for (let t in configs[cf].teams) {

                    if (configs[cf].teams[t].name == team) {

                        for (let l in configs[cf].teams[t].trello.lists) {

                            lists.push({id: configs[cf].teams[t].trello.lists[l].id, name: configs[cf].teams[t].trello.lists[l].name})

                            await axios.get("https://api.trello.com/1/lists/" + configs[cf].teams[t].trello.lists[l].id + "/cards?key=" + this.key + "&token=" + this.token)
                                .then(r => {

                                    let res: ReturnList[] = r.data

                                    for (let c in res) {

                                        if (res[c].idMembers.includes(id)) {

                                            let UsersSelect: String[] = []

                                            for (let idm in res[c].idMembers) {

                                                for (let u in configs[cf].teams[t].users) {

                                                    if (configs[cf].teams[t].users[u].id == res[c].idMembers[idm]) {

                                                        UsersSelect.push(configs[cf].teams[t].users[u].name)

                                                    }

                                                }

                                            }

                                            switch (configs[cf].teams[t].trello.lists[l].name) {

                                                case "To Do": case "Doing":

                                                    AddNode(res[c].name, res[c].id, false);

                                                    console.log(UsersSelect)
                                                    console.log(Multis[Multis.length - 1])

                                                    Multis[Multis.length - 1].multi.set(UsersSelect)

                                                    break;

                                                case "Done":

                                                    continue;

                                                case "Blocked":

                                                    AddNode(res[c].name, res[c].id, true, res[c].desc.replace("Impedimento: ", ""));

                                                    console.log(UsersSelect)
                                                    console.log(Multis[Multis.length - 1])

                                                    Multis[Multis.length - 1].multi.set(UsersSelect)

                                                    break;

                                                case "Deliveries":

                                                    let dia: "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "proxima" = "segunda"
                                                    let status: "fazendo" | "impedida" | "nao entregada" | "concluido" = "fazendo"

                                                    let split = new Date(res[c].due).toString().split(" ")

                                                    if (res[c].desc.includes("Impedimento:")) {

                                                        switch (split[0]) {

                                                            case "Mon": {

                                                                dia = "segunda"
                                                                break

                                                            }

                                                            case "Tue": {

                                                                dia = "terca"
                                                                break

                                                            }

                                                            case "Web": {

                                                                dia = "quarta"
                                                                break

                                                            }

                                                            case "Thu": {

                                                                dia = "quinta"
                                                                break

                                                            }

                                                            case "Fri": {

                                                                if (parseInt(moment().utc().format().toString().split(" ")[2]) - parseInt(split[2]) > -7) {

                                                                    dia = "sexta"
                                                                    break

                                                                }
                                                                else {

                                                                    dia = "proxima"
                                                                    break

                                                                }

                                                            }

                                                        }

                                                        if (res[c].dueComplete) {

                                                            status = "concluido"

                                                        }
                                                        else {

                                                            if (new Date(res[c].due).getTime() < Date.now()) {

                                                                status = "nao entregada"

                                                                AddNodeEntregas(res[c].name, res[c].id, false, status, dia, res[c].desc.replace("Impedimento: ", ""))

                                                                console.log(UsersSelect)
                                                                console.log(Multis[Multis.length - 1])
            
                                                                Multis[Multis.length - 1].multi.set(UsersSelect)

                                                            }
                                                            else {

                                                                status = "impedida"

                                                                AddNodeEntregas(res[c].name, res[c].id, true, status, dia, res[c].desc.replace("Impedimento: ", ""))

                                                                console.log(UsersSelect)
                                                                console.log(Multis[Multis.length - 1])
            
                                                                Multis[Multis.length - 1].multi.set(UsersSelect)

                                                            }

                                                        }

                                                    }
                                                    else {

                                                        switch (split[0]) {

                                                            case "Mon": {

                                                                dia = "segunda"
                                                                break

                                                            }

                                                            case "Tue": {

                                                                dia = "terca"
                                                                break

                                                            }

                                                            case "Web": {

                                                                dia = "quarta"
                                                                break

                                                            }

                                                            case "Thu": {

                                                                dia = "quinta"
                                                                break

                                                            }

                                                            case "Fri": {

                                                                if (parseInt(moment().utc().format().toString().split("-")[2]) - parseInt(split[2]) >= -7) {

                                                                    dia = "sexta"
                                                                    break

                                                                }
                                                                else {

                                                                    dia = "proxima"
                                                                    break

                                                                }

                                                            }

                                                        }

                                                        if (res[c].dueComplete) {

                                                            status = "concluido"

                                                        }
                                                        else {

                                                            if (new Date(res[c].due).getTime() < Date.now()) {

                                                                status = "nao entregada"

                                                            }

                                                        }

                                                        AddNodeEntregas(res[c].name, res[c].id, false, status, dia)

                                                        console.log(UsersSelect)
                                                        console.log(Multis[Multis.length - 1])

                                                        Multis[Multis.length - 1].multi.set(UsersSelect)

                                                    }

                                                    break;

                                            }

                                        }

                                    }

                                    setTimeout(async () => {

                                        await progressBar.setCompleted();

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

            console.log("posting: " + JSON.stringify(Todo) + "\n\n" + JSON.stringify(Doing) + "\n\n" + JSON.stringify(Blocked) + "\n\n" + JSON.stringify(Done) + "\n\n" + JSON.stringify(Deliveries))

            const progressBar = new ProgressBar({
                text: 'Enviando tarefas para Trello...',
                detail: 'Espere...',
                title: 'Enviando...'
            });

            progressBar.on('completed', function () {
                console.log("post concluido")
                progressBar.detail = 'Enviado. Fechando...';
            })

            progressBar.on('aborted', function () {
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

                                        IdUsers += "," + Users[u].id

                                    }

                                }

                            }

                        }

                    }

                    console.log(IdUsers)

                    await axios.put("https://api.trello.com/1/cards/" + Todo[i].Card_Id + "?idList=" + LTodo +"&name="+Todo[i].Descricao+ "&idMembers=" + IdUsers + "&desc=" + "&key=" + this.key + "&token=" + this.token)
                        .then(r => {

                            //alert("deu")

                        })
                        .catch(e => {

                            //alert("deu erro: "+e)
                            progressBar.detail = "Um erro ocorreu: " + e
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

                                        IdUsers += "," + Users[u].id

                                    }

                                }

                            }

                        }

                    }

                    await axios.put("https://api.trello.com/1/cards/" + Doing[i].Card_Id + "?idList=" + LDoing +"&name="+Doing[i].Descricao+ "&idMembers=" + IdUsers + "&desc=" + "&key=" + this.key + "&token=" + this.token)
                        .then(r => {

                            // alert("deu")

                        })
                        .catch(e => {

                            progressBar.detail = "Um erro ocorreu: " + e
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

                                        IdUsers += "," + Users[u].id

                                    }

                                }

                            }

                        }

                    }

                    await axios.put("https://api.trello.com/1/cards/" + Blocked[i].Card_Id + "?idList=" + LBlocked +"&name="+Blocked[i].Descricao+ "&desc=Impedimento: " + Blocked[i].Impedimento + "&idMembers=" + IdUsers + "&key=" + this.key + "&token=" + this.token)
                        .then(r => {

                            // alert("deu")

                        })
                        .catch(e => {

                            progressBar.detail = "Um erro ocorreu: " + e
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

                                        IdUsers += "," + Users[u].id

                                    }

                                }

                            }

                        }

                    }

                    await axios.put("https://api.trello.com/1/cards/" + Done[i].Card_Id + "?idList=" + LDone +"&name="+Done[i].Descricao+ "&idMembers=" + IdUsers + "&desc=" + "&key=" + this.key + "&token=" + this.token)
                        .then(r => {

                            // alert("deu")

                        })
                        .catch(e => {

                            progressBar.detail = "Um erro ocorreu: " + e
                            progressBar.close()

                            return false

                        })

                }

            }

            if (Deliveries[0] != undefined) {

                for (let i in Deliveries) {

                    console.log("posting Deliveries")
                    progressBar.detail = "Enviando Deliveries"

                    let IdUsers = ""

                    for (let m in Multis) {

                        if (Multis[m].id.replace("multiple_", "") == Deliveries[i].Card_Id) {

                            for (let u in Users) {

                                if (Multis[m].value.includes(Users[u].name)) {

                                    if (IdUsers == "") {

                                        IdUsers += Users[u].id

                                    }
                                    else {

                                        IdUsers += "," + Users[u].id

                                    }

                                }

                            }

                        }

                    }

                    if (Deliveries[i].Status == "fazendo") {

                        await axios.put("https://api.trello.com/1/cards/" + Deliveries[i].Card_Id + "?idList=" + LDeliveries +"&name="+Deliveries[i].Descricao+ "&due=" + Deliveries[i].Dia + "&dueComplete=false" + "&desc=" + "&idMembers=" + IdUsers + "&key=" + this.key + "&token=" + this.token)
                            .then(r => {

                                // alert("deu")

                            })
                            .catch(e => {

                                progressBar.detail = "Um erro ocorreu: " + e
                                progressBar.close()

                                return false

                            })

                    }

                    if (Deliveries[i].Status == "impedida") {

                        await axios.put("https://api.trello.com/1/cards/" + Deliveries[i].Card_Id + "?idList=" + LDeliveries +"&name="+Deliveries[i].Descricao+ "&due=" + Deliveries[i].Dia + "&dueComplete=false" + "&idMembers=" + IdUsers + "&desc=Impedimento: " + Deliveries[i].Impedimento + "&key=" + this.key + "&token=" + this.token)
                            .then(r => {

                                // alert("deu")

                            })
                            .catch(e => {

                                progressBar.detail = "Um erro ocorreu: " + e
                                progressBar.close()

                                return false

                            })

                    }

                    if (Deliveries[i].Status == "nao entregada") {

                        await axios.put("https://api.trello.com/1/cards/" + Deliveries[i].Card_Id + "?idList=" + LDeliveries +"&name="+Deliveries[i].Descricao+ "&due=" + Deliveries[i].Dia + "&dueComplete=false" + "&desc=" + "&idMembers=" + IdUsers + "&key=" + this.key + "&token=" + this.token)
                            .then(r => {

                                // alert("deu")

                            })
                            .catch(e => {

                                progressBar.detail = "Um erro ocorreu: " + e
                                progressBar.close()

                                return false

                            })

                    }

                    if (Deliveries[i].Status == "concluido") {

                        await axios.put("https://api.trello.com/1/cards/" + Deliveries[i].Card_Id + "?idList=" + LDeliveries +"&name="+Deliveries[i].Descricao+ "&due=" + Deliveries[i].Dia + "&dueComplete=true" + "&desc=" + "&idMembers=" + IdUsers + "&key=" + this.key + "&token=" + this.token)
                            .then(r => {

                                // alert("deu")

                            })
                            .catch(e => {

                                progressBar.detail = "Um erro ocorreu: " + e
                                progressBar.close()

                                return false

                            })

                    }

                }

            }

            if (select_user != undefined && NEscolido.includes(select_user.value)) {

                NEscolido.splice(NEscolido.indexOf(select_user.value), 1)

            }

            sleep(1)
            progressBar.setCompleted()
            sleep(1)
            
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

        const select: HTMLSelectElement | null = document.querySelector("select#" + id)

        for (let opt in select?.options) {

            select?.options.remove(parseInt(opt))

        }

    }

    //for (let file in configsInDir) {

        config = electron.remote.getGlobal('login')

        configs.push(config)

        for (let t in config.teams) {

            AddToSelect("select_team", config.teams[t].name, config.name + " > " + config.area)

        }

    //}

    interface Multi {

        multi: any
        id: String,
        value: String[]

    }

    interface dataSelect {

        text: string | undefined,
        value: string | string[] | undefined,
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

            select: "." + id,
            placeholder: "- Selecione ao menos 1 pessoa -",
            data: data,
            onChange: (e: MultiChange[]) => { PegaValorMulti(e, id) }

        })

        for (let d in data) {

            if (data[d].mandatory) {

                multi.set([data[d].value])

            }

        }

        Multis.push({ id: id, multi: multi, value: multi.selected() })

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
        
                <div style="background-color: #22323f;" id="tf_`+ id + `">

                    <div style="background-color: #22323f; id="tf_`+ id + `">

                        <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+ id + `">

                            <textarea id="text_tarefa_`+ id + `" name="text_tarefa_` + id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>` + tarefa + `</textarea>

                            <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                                <select id="select_status_`+ id + `" name="select_status_` + id + `" style="color: white; background-color: #2b3f4e;">

                                    <option value="Vou fazer hoje">Vou fazer hoje</option>
                                    <option value="Não Vou fazer hoje">Não Vou fazer hoje</option>
                                    <option value="Concluido">Concluido</option>
                                    <option value="Impedido" selected>Impedido</option>

                                </select>

                                <textarea id="text_impedimento_`+ id + `" name="text_impedimento_` + id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px;" placeholder="Expecifique o impedimento..." required>` + impedimento + `</textarea>

                                <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>

                            </div>

                        </div>

                    </div>

                </div>

            `

        }
        else {

            HTML = `

                <div style="background-color: #22323f;" id="tf_`+ id + `">
        
                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+ id + `">

                        <textarea id="text_tarefa_`+ id + `" name="text_tarefa_` + id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required>` + tarefa + `</textarea>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_status_`+ id + `" name="select_status_` + id + `" style="color: white; background-color: #2b3f4e;">

                                <option value="Vou fazer hoje" selected>Vou fazer hoje</option>
                                <option value="Não Vou fazer hoje">Não Vou fazer hoje</option>
                                <option value="Concluido">Concluido</option>
                                <option value="Impedido">Impedido</option>

                            </select>

                        </div>

                        <textarea id="text_impedimento_`+ id + `" name="text_impedimento_` + id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>

                        <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>

                    </div>

                </div>

            `

        }

        div_tarefas2?.insertAdjacentHTML("beforeend", HTML)

        let data: dataSelect[] = [];

        data.push({ text: select_user?.value, value: select_user?.value, mandatory: true })

        for (let o in select_user?.options) {

            if (o == "0" || o == "1") {

                continue

            }
            else {

                if (select_user?.options[parseInt(o)] == undefined) {

                    break

                }
                else if (select_user?.options[parseInt(o)].value != select_user.value) {

                    data.push({ text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value })

                }

            }

        }

        GeraMulti("multiple_" + id, data)

        const select: HTMLSelectElement | null | undefined = div_tarefas2?.querySelector("select#select_status_" + id)
        const text_impedimento: HTMLTextAreaElement | null | undefined = div_tarefas2?.querySelector("textarea#text_impedimento_" + id)

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

    const AddNodeEntregas = (entrega: string, id: string, impedida: boolean, status: "fazendo" | "impedida" | "nao entregada" | "concluido", dia: "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "proxima", impedimento?: string) => {

        let HTML = ""

        if (impedida) {

            HTML = `
        
                <div style="background-color: #22323f;" id="en_`+ id + `">

                    <div style="background-color: #22323f; id="en_`+ id + `">

                        <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+ id + `">

                            <textarea id="text_entrega_`+ id + `" name="text_entrega_` + id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required>` + entrega + `</textarea>

                            <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                                <select id="select_status_`+ id + `" name="select_status_` + id + `" style="color: white; background-color: #2b3f4e;">

                                    <option selected>Fazendo</option>
                                    <option>Não entrege</option>
                                    <option>Concluido</option>
                                    <option>Impedido</option>

                                </select>

                            <div>

                            <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                                <select id="select_data_`+ id + `" name="select_data_` + id + `" style="color: white; background-color: #2b3f4e;">

                                    <option>Segunda</option>
                                    <option>Terça</option>
                                    <option>Quarta</option>
                                    <option>Quinta</option>
                                    <option>Sexta</option>
                                    <option>Proxima Semana</option>

                                </select>

                            </div>

                            <textarea id="text_impedimento_`+ id + `" name="text_impedimento_` + id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px;" placeholder="Expecifique o impedimento..." required>` + impedimento + `</textarea>

                            <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>

                        </div>

                    </div>

                </div>

            `

        }
        else {

            HTML = `

                <div style="background-color: #22323f;" id="en_`+ id + `">
        
                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="en_`+ id + `">

                        <textarea id="text_entrega_`+ id + `" name="text_entrega_` + id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required>` + entrega + `</textarea>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_status_`+ id + `" name="select_status_` + id + `" style="color: white; background-color: #2b3f4e;">

                                <option selected>Fazendo</option>
                                <option>Não entrege</option>
                                <option>Concluido</option>
                                <option>Impedido</option>

                            </select>

                        <div>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_data_`+ id + `" name="select_data_` + id + `" style="color: white; background-color: #2b3f4e;">

                                <option>Segunda</option>
                                <option>Terça</option>
                                <option>Quarta</option>
                                <option>Quinta</option>
                                <option>Sexta</option>
                                <option>Proxima Semana</option>

                            </select>

                        </div>

                        <textarea id="text_impedimento_`+ id + `" name="text_impedimento_` + id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>

                        <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>

                    </div>

                </div>

            `

        }

        div_entregas2?.insertAdjacentHTML("beforeend", HTML)

        let data: dataSelect[] = [];

        data.push({ text: select_user?.value, value: select_user?.value, mandatory: true })

        for (let o in select_user?.options) {

            if (o == "0" || o == "1") {

                continue

            }
            else {

                if (select_user?.options[parseInt(o)] == undefined) {

                    break

                }
                else if (select_user?.options[parseInt(o)].value != select_user.value) {

                    data.push({ text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value })

                }

            }

        }

        GeraMulti("multiple_" + id, data)

        const select: HTMLSelectElement | null | undefined = div_entregas2?.querySelector("select#select_status_" + id)
        const s_data: HTMLSelectElement | null | undefined = div_entregas2?.querySelector("select#select_data_" + id)
        const text_impedimento: HTMLTextAreaElement | null | undefined = div_entregas2?.querySelector("textarea#text_impedimento_" + id)

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

        if (select != undefined) {

            switch (status) {

                case "fazendo": {

                    select.value = "Fazendo"
                    break

                }

                case "concluido": {

                    select.value = "Concluido"
                    break

                }

                case "impedida": {

                    select.value = "Impedido"
                    break

                }

                case "nao entregada": {

                    select.value = "Não entrege"
                    break

                }

            }

        }

        if (s_data != undefined) {

            switch (dia) {

                case "segunda": {

                    s_data.value = "Segunda"
                    break

                }

                case "terca": {

                    s_data.value = "Terça"
                    break

                }

                case "quarta": {

                    s_data.value = "Quarta"
                    break

                }

                case "quinta": {

                    s_data.value = "Quinta"
                    break

                }

                case "sexta": {

                    s_data.value = "Sexta"
                    break

                }

                case "proxima": {

                    s_data.value = "Proxima Semana"
                    break

                }

            }

        }

    }

    const change_user = async () => {

        const User = select_user?.value
        const Team = select_team?.value

        Multis = []

        if (div_tarefas2 != undefined) {

            for (let i = div_tarefas2?.children.length || 0; i >= 1; i--) {

                div_tarefas2?.removeChild(div_tarefas2.children[i - 1])

            }

        }

        if (div_entregas2 != undefined) {

            for (let i = div_entregas2?.children.length || 0; i >= 1; i--) {

                div_entregas2?.removeChild(div_entregas2.children[i - 1])

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

                    if (ops.indexOf(sel) == ops.length - 1) {

                        sel = ops[ops.indexOf(sel) - 1]

                    }
                    else {

                        sel = ops[ops.indexOf(sel) + 1]

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

                team = Team || ""
                user = User || ""

                for (let cf in configs) {

                    for (let t in configs[cf].teams) {

                        if (configs[cf].teams[t].name == Team) {

                            console.log("a")

                            for (let u in configs[cf].teams[t].users) {

                                if (configs[cf].teams[t].users[u].name == User) {

                                    console.log("pega trello")

                                    idUser = configs[cf].teams[t].users[u].id

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
            div_entregas?.setAttribute("style", "display: none")

        }

    }

    const change_team = () => {

        let b = false

        ClearSelect("select_user")

        if (select_team != undefined && select_team.value != "") {

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

                            idUsers.push({name: configs[config].teams[team].users[user].name, id: configs[config].teams[team].users[user].id})

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
            div_3?.setAttribute("style", "background-color: #22323f; display: block;")

        }
        else {

            div_2?.setAttribute("style", "display: none;")
            div_3?.setAttribute("style", "background-color: #22323f; display: none;")

        }

    }

    const sleep = (s: number) => {

        let inicio = Date.now()

        let ms = s*1000

        while (true) {

            if (Date.now() >= inicio+ms) {

                break

            }

        }

    }

    interface ReturnNewCard {

        "id": "5ebd496c1daccc81d4ca77bd",
        "checkItemStates": [],
        "closed": false,
        "dateLastActivity": "2020-05-14T13:36:44.207Z",
        "desc": "",
        "descData": {
            "emoji": {}
        },
        "dueReminder": null,
        "idBoard": "5e94733d9aa4b24167774a96",
        "idList": "5eb97f35418afa565d01a922",
        "idMembersVoted": [],
        "idShort": 13,
        "idAttachmentCover": null,
        "idLabels": [],
        "manualCoverAttachment": false,
        "name": "test",
        "pos": 98303,
        "shortLink": "lF6LiA2J",
        "isTemplate": false,
        "dueComplete": false,
        "due": null,
        "email": null,
        "labels": [],
        "shortUrl": "https://trello.com/c/lF6LiA2J",
        "url": "https://trello.com/c/lF6LiA2J/13-test",
        "cover": {
            "idAttachment": null,
            "color": null,
            "idUploadedBackground": null,
            "size": "normal",
            "brightness": "light"
        },
        "idMembers": [],
        "badges": {
            "attachmentsByType": {
                "trello": {
                    "board": 0,
                    "card": 0
                }
            },
            "location": false,
            "votes": 0,
            "viewingMemberVoted": false,
            "subscribed": false,
            "fogbugz": "",
            "checkItems": 0,
            "checkItemsChecked": 0,
            "checkItemsEarliestDue": null,
            "comments": 0,
            "attachments": 0,
            "description": false,
            "due": null,
            "dueComplete": false
        },
        "subscribed": false,
        "attachments": [],
        "idChecklists": [],
        "stickers": [],
        "limits": {}

    }

    bt_add?.forEach(b => {

        b.addEventListener('click', async (e) => {

            const progressBar = new ProgressBar({
                text: 'Adicionando nova tarefa...',
                detail: 'Espere...',
                title: 'Adicionando...'
            });

            progressBar.on('completed', function () {
                console.log("get concluido")
                progressBar.detail = 'Adicionado. Fechando...';
            })

            progressBar.on('aborted', function () {
                console.info(`get abortado`);
                Swal.fire('O trello não respondeu :(', 'Infelismente o sistema só funciona com o trello, tente novamente mais tarde', 'error')
            });

            let list = ""

            for (let c in lists) {

                if (lists[c].name == "To Do") {

                    list = lists[c].id
                    break

                }

            }

            interface ReturnNewCard {

                "id": "5ebd496c1daccc81d4ca77bd",
                "checkItemStates": [],
                "closed": false,
                "dateLastActivity": "2020-05-14T13:36:44.207Z",
                "desc": "",
                "descData": {
                    "emoji": {}
                },
                "dueReminder": null,
                "idBoard": "5e94733d9aa4b24167774a96",
                "idList": "5eb97f35418afa565d01a922",
                "idMembersVoted": [],
                "idShort": 13,
                "idAttachmentCover": null,
                "idLabels": [],
                "manualCoverAttachment": false,
                "name": "test",
                "pos": 98303,
                "shortLink": "lF6LiA2J",
                "isTemplate": false,
                "dueComplete": false,
                "due": null,
                "email": null,
                "labels": [],
                "shortUrl": "https://trello.com/c/lF6LiA2J",
                "url": "https://trello.com/c/lF6LiA2J/13-test",
                "cover": {
                    "idAttachment": null,
                    "color": null,
                    "idUploadedBackground": null,
                    "size": "normal",
                    "brightness": "light"
                },
                "idMembers": [],
                "badges": {
                    "attachmentsByType": {
                        "trello": {
                            "board": 0,
                            "card": 0
                        }
                    },
                    "location": false,
                    "votes": 0,
                    "viewingMemberVoted": false,
                    "subscribed": false,
                    "fogbugz": "",
                    "checkItems": 0,
                    "checkItemsChecked": 0,
                    "checkItemsEarliestDue": null,
                    "comments": 0,
                    "attachments": 0,
                    "description": false,
                    "due": null,
                    "dueComplete": false
                },
                "subscribed": false,
                "attachments": [],
                "idChecklists": [],
                "stickers": [],
                "limits": {}

            }

            await axios.post("https://api.trello.com/1/cards?name=Nova Tarefa&idList=" + list + "&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
            .then((r: AxiosResponse<ReturnNewCard>) => {

                div_tarefas?.setAttribute("style", "display: block")

                const id = r.data.id

                let HTML = `
                
                    <div style="background-color: #22323f;" id="tf_`+ id + `">
            
                        <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="`+ id + `">
            
                            <textarea id="text_tarefa_`+ id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a tarefa..." required></textarea>
            
                            <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">
            
                                <select id="select_status_`+ id + `" style="color: white; background-color: #2b3f4e;">
            
                                    <option value="Vou fazer hoje" selected>Vou fazer hoje</option>
                                    <option value="Não Vou fazer hoje">Não Vou fazer hoje</option>
                                    <option value="Concluido">Concluido</option>
                                    <option value="Impedido">Impedido</option>
            
                                </select>
            
                                <textarea id="text_impedimento_`+ id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>
            
                                <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>

                            </div>
            
                        </div>
            
                    </div>
            
                `

                div_tarefas2?.insertAdjacentHTML("beforeend", HTML)

                let data: dataSelect[] = [];

                data.push({ text: select_user?.value, value: select_user?.value, mandatory: true })

                for (let o in select_user?.options) {

                    if (o == "0" || o == "1") {

                        continue

                    }
                    else {

                        if (select_user?.options[parseInt(o)] == undefined) {

                            break

                        }
                        else if (select_user?.options[parseInt(o)].value != select_user.value) {

                            data.push({ text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value })

                        }

                    }

                }

                GeraMulti("multiple_" + id, data)

                const select: HTMLSelectElement | null | undefined = div_tarefas2?.querySelector("select#select_status_" + id)
                const text_impedimento: HTMLTextAreaElement | null | undefined = div_tarefas2?.querySelector("textarea#text_impedimento_" + id)

                select?.addEventListener("change", (e) => {

                    if (select.value == "Impedido") {

                        text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")

                    }
                    else {

                        text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")

                    }

                })

                setTimeout(() => {

                    progressBar.setCompleted();

                }, 1000)

            })
            .catch(e => {

                div_tarefas?.setAttribute("style", "display: none")

                progressBar.close()

                console.log(e)

            })

        })

    })

    bt_add_entregas?.forEach(b => {

        b.addEventListener('click', async (e) => {

            const progressBar = new ProgressBar({
                text: 'Adicionando nova entrega...',
                detail: 'Espere...',
                title: 'Adicionando...'
            });

            progressBar.on('completed', function () {
                console.log("get concluido")
                progressBar.detail = 'Adicionado. Fechando...';
            })

            progressBar.on('aborted', function () {
                console.info(`get abortado`);
                Swal.fire('O trello não respondeu :(', 'Infelismente o sistema só funciona com o trello, tente novamente mais tarde', 'error')
            });

            let list = ""

            console.log(lists)

            for (let c in lists) {

                console.log(lists)
                console.log(lists[c])

                if (lists[c].name == "Deliveries") {

                    list = lists[c].id
                    break

                }

            }

            await axios.post("https://api.trello.com/1/cards?name=Nova Entrega&idList=" + list + "&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
            .then((r: AxiosResponse<ReturnNewCard>) => {

                div_entregas?.setAttribute("style", "display: block")

                const id = r.data.id

                let HTML = `
            
                <div style="background-color: #22323f;" id="en_`+ id + `">
        
                    <div style="padding: 10px; margin-top: 10px; margin-bottom: 10px;" id="en_`+ id + `">
        
                        <textarea id="text_entrega_`+ id + `" style="background-color: #2b3f4e; text-align: center;" placeholder="Expecifique a entrega..." required></textarea>
        
                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">
        
                            <select id="select_status_`+ id + `" style="color: white; background-color: #2b3f4e;">
        
                                <option selected>Fazendo</option>
                                <option>Não entrege</option>
                                <option>Concluido</option>
                                <option>Impedido</option>
        
                            </select>

                        </div>

                        <div class="select-wrapper" id="select_cinza" style="margin-top: 10px;">

                            <select id="select_data_`+ id + `" name="select_data_` + id + `" style="color: white; background-color: #2b3f4e;">

                                <option>Segunda</option>
                                <option>Terça</option>
                                <option>Quarta</option>
                                <option>Quinta</option>
                                <option selected>Sexta</option>
                                <option>Proxima Semana</option>

                            </select>

                        </div>
        
                        <textarea id="text_impedimento_`+ id + `" style="background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none" placeholder="Expecifique o impedimento..."></textarea>
        
                        <select id="multiple_`+ id + `" class="multiple_` + id + `" name="multiple_` + id + `" multiple></select>
        
                    </div>
        
                </div>
        
            `

                div_entregas2?.insertAdjacentHTML("beforeend", HTML)

                let data: dataSelect[] = [];

                data.push({ text: select_user?.value, value: select_user?.value, mandatory: true })

                for (let o in select_user?.options) {

                    if (o == "0" || o == "1") {

                        continue

                    }
                    else {

                        if (select_user?.options[parseInt(o)] == undefined) {

                            break

                        }
                        else if (select_user?.options[parseInt(o)].value != select_user.value) {

                            data.push({ text: select_user?.options[parseInt(o)].value, value: select_user?.options[parseInt(o)].value })

                        }

                    }

                }

                GeraMulti("multiple_" + id, data)

                const select: HTMLSelectElement | null | undefined = div_entregas2?.querySelector("select#select_status_" + id)
                const text_impedimento: HTMLTextAreaElement | null | undefined = div_entregas2?.querySelector("textarea#text_impedimento_" + id)

                select?.addEventListener("change", (e) => {

                    if (select.value == "Impedido") {

                        text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: block")

                    }
                    else {

                        text_impedimento?.setAttribute("style", "background-color: #2b3f4e; text-align: center; margin-top: 10px; display: none")

                    }

                })

                setTimeout(() => {

                    progressBar.setCompleted();

                }, 1000)

            })
            .catch(e => {

                div_tarefas?.setAttribute("style", "display: none")

                progressBar.close()

                console.log(e)

            })

        })

    })

    select_user?.addEventListener('change', change_user)

    select_team?.addEventListener('change', change_team)

    from_team?.addEventListener('submit', async (e) => {

        e.preventDefault()

        const tr = new Trello("c8055ea81e83e2f2aee0a17139667194", "3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

        const div_tf: HTMLDivElement | null = document.querySelector("div#d_tf")
        const div_en: HTMLDivElement | null = document.querySelector("div#d_en")

        let Todo: ObjTrello[] = []
        let Doing: ObjTrello[] = []
        let Done: ObjTrello[] = []
        let Bloked: ObjTrello[] = []
        let Deliveries: ObjDeliveries[] = []

        if (div_tf?.children.length != undefined) {

            for (let i = 0; i < div_tf?.children.length; i++) {

                const id = div_tf?.children[i].id.replace("tf_", "")

                const text: HTMLTextAreaElement | null = div_tf?.children[i].querySelector("textarea#text_tarefa_" + id)
                const select: HTMLSelectElement | null = div_tf?.children[i].querySelector("select#select_status_" + id)
                const imp: HTMLSelectElement | null = div_tf?.children[i].querySelector("textarea#text_impedimento_" + id)

                const desc = text?.value

                switch (select?.value) {

                    case "Vou fazer hoje": {

                        Doing.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Não Vou fazer hoje": {

                        Todo.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Concluido": {

                        Done.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Impedido": {

                        Bloked.push({ Card_Id: id, Descricao: desc || "", Impedida: true, Impedimento: imp?.value || "" })
                        break

                    }

                }

            }

            if (div_en?.children.length != undefined) {

                for (let i = 0; i < div_en?.children.length; i++) {

                    const id = div_en?.children[i].id.replace("en_", "")

                    const text: HTMLTextAreaElement | null = div_en?.children[i].querySelector("textarea#text_entrega_" + id)
                    const select: HTMLSelectElement | null = div_en?.children[i].querySelector("select#select_status_" + id)
                    const data: HTMLSelectElement | null = div_en?.children[i].querySelector("select#select_data_" + id)
                    const imp: HTMLSelectElement | null = div_en?.children[i].querySelector("textarea#text_impedimento_" + id)

                    const desc = text?.value

                    switch (select?.value) {

                        case "Fazendo": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Não entrege": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Concluido": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Impedido": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(1).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(2).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(3).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(4).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(5).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(12).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                            }

                            break

                        }

                    }

                }

            }

            await tr.PostTrello(Todo, Doing, Bloked, Done, Deliveries)

        }

    })

    interface ReturnNewChecklist {
        "id": "",
        "name": "teste",
        "idCard": "",
        "pos": number,
        "idBoard": "",
        "checkItems": [],
        "limits": {}
    }

    interface ReturnNewCheckOnCheckList {
        "idChecklist": "5ebec3638e980954112a78cf",
        "state": "complete",
        "idMember": null,
        "id": "5ebec3810d022133fdf5d001",
        "name": "bbb",
        "nameData": {
            "emoji": {}
        },
        "pos": 32768,
        "due": null,
        "limits": {}
    }

    from_reset?.addEventListener('submit', async (e) => {

        e.preventDefault()

        const tr = new Trello("c8055ea81e83e2f2aee0a17139667194", "3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

        const div_tf: HTMLDivElement | null = document.querySelector("div#d_tf")
        const div_en: HTMLDivElement | null = document.querySelector("div#d_en")

        const t_semana: HTMLInputElement | null = document.querySelector('input#t_semana')

        let Todo: ObjTrello[] = []
        let Doing: ObjTrello[] = []
        let Done: ObjTrello[] = []
        let Bloked: ObjTrello[] = []
        let Deliveries: ObjDeliveries[] = []

        if (div_tf?.children.length != undefined) {

            for (let i = 0; i < div_tf?.children.length; i++) {

                const id = div_tf?.children[i].id.replace("tf_", "")

                const text: HTMLTextAreaElement | null = div_tf?.children[i].querySelector("textarea#text_tarefa_" + id)
                const select: HTMLSelectElement | null = div_tf?.children[i].querySelector("select#select_status_" + id)
                const imp: HTMLSelectElement | null = div_tf?.children[i].querySelector("textarea#text_impedimento_" + id)

                const desc = text?.value

                switch (select?.value) {

                    case "Vou fazer hoje": {

                        Doing.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Não Vou fazer hoje": {

                        Todo.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Concluido": {

                        Done.push({ Card_Id: id, Descricao: desc || "", Impedida: false, Impedimento: "" })
                        break

                    }

                    case "Impedido": {

                        Bloked.push({ Card_Id: id, Descricao: desc || "", Impedida: true, Impedimento: imp?.value || "" })
                        break

                    }

                }

            }

            if (div_en?.children.length != undefined) {

                for (let i = 0; i < div_en?.children.length; i++) {

                    const id = div_en?.children[i].id.replace("en_", "")

                    const text: HTMLTextAreaElement | null = div_en?.children[i].querySelector("textarea#text_entrega_" + id)
                    const select: HTMLSelectElement | null = div_en?.children[i].querySelector("select#select_status_" + id)
                    const data: HTMLSelectElement | null = div_en?.children[i].querySelector("select#select_data_" + id)
                    const imp: HTMLSelectElement | null = div_en?.children[i].querySelector("textarea#text_impedimento_" + id)

                    const desc = text?.value

                    switch (select?.value) {

                        case "Fazendo": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Não entrege": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "nao entregada", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "fazendo", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Concluido": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(1).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(2).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(3).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(4).format('LLLL'), Impedimento: "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(5).format('LLLL'), Impedimento: "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "concluido", Dia: moment().day(12).format('LLLL'), Impedimento: "" })

                                    break

                                }

                            }

                            break

                        }

                        case "Impedido": {

                            switch (data?.value) {

                                case "Segunda": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(1).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                                case "Terça": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(2).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Quarta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(3).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Quinta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(4).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }
                                case "Sexta": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(5).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                                case "Proxima Semana": {

                                    Deliveries.push({ Card_Id: id, Descricao: desc || "", Status: "impedida", Dia: moment().day(12).format('LLLL'), Impedimento: imp?.value || "" })

                                    break

                                }

                            }

                            break

                        }

                    }

                }

            }

            await tr.PostTrello(Todo, Doing, Bloked, Done, Deliveries)

        }

        interface CheckItens {

            nome: string,
            marcada: boolean,
            pessoas: string[],
            id: string

        }

        interface CheckBloq {

            nome: string,
            marcada: boolean,
            pessoas: string[],
            tipo: "Tarefa" | "Entrega",
            id: string

        }

        let Entregas: CheckItens[] = []
        let Tarefas: CheckItens[] = []
        let Bloqueadas: CheckBloq[] = []

        let listPast: string = ""

        let idCard: string = ""
        
        let idEntregas: string = "" 
        let idTarefas: string = ""
        let idBloqueadas: string = ""

        const progressBar = new ProgressBar({
            text: 'Finalizando Semana...',
            detail: 'Espere...',
            title: 'Finalizando...'
        });

        progressBar.on('completed', function () {
            progressBar.detail = 'Finalizado. Fechando...';
        })

        progressBar.on('aborted', function () {
            console.info(`finalizacao abortado`);
            Swal.fire('O trello não respondeu :(', 'Infelismente o sistema só funciona com o trello, tente novamente mais tarde', 'error')
        });

        console.log(progressBar)

        for (let cf in configs) {

            for (let t in configs[cf].teams) {

                if (configs[cf].teams[t].name == select_team?.value) {

                    for (let l in configs[cf].teams[t].trello.lists) {

                        lists = configs[cf].teams[t].trello.lists

                    }

                }

            }

        }

        for (let l in lists) {

            if (lists[l].name == "Past") {

                listPast = lists[l].id

                continue

            }
            else {

                await axios.get("https://api.trello.com/1/lists/" + lists[l].id + "/cards?key=" + "c8055ea81e83e2f2aee0a17139667194" + "&token=" + "3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                .then(r => {

                    let res: ReturnList[] = r.data

                    for (let c in res) {

                        let users: string[] = []

                        for (let u in res[c].idMembers) {

                            for (let i in idUsers) {

                                if (idUsers[i].id == res[c].idMembers[u]) {

                                    users.push(idUsers[i].name)
                                    break

                                }

                            }

                        }

                        switch (lists[l].name) {

                            case "To Do": case "Doing": {

                                Tarefas.push({nome: res[c].name, marcada: false, pessoas: users, id: res[c].id})

                                break

                            }

                            case "Done": {

                                Tarefas.push({nome: res[c].name, marcada: true, pessoas: users, id: res[c].id})

                                break

                            }

                            case "Blocked": {

                                Bloqueadas.push({nome: res[c].name, marcada: false, pessoas: users, tipo: "Tarefa", id: res[c].id})

                                break

                            }

                            case "Deliveries": {

                                if (res[c].dueComplete) {                        
                                    
                                    Entregas.push({nome: res[c].name, marcada: true, pessoas: users, id: res[c].id})

                                }
                                else if (res[c].desc.includes("impedimento: ")) {

                                    Bloqueadas.push({nome: res[c].name, marcada: false, pessoas: users, tipo: "Entrega", id: res[c].id})

                                }
                                else {

                                    Entregas.push({nome: res[c].name, marcada: false, pessoas: users, id: res[c].id})

                                }

                                break

                            }

                        }

                    }

                })

            }

        }

        progressBar.detail = "Criando Card..."

        await axios.post("https://api.trello.com/1/cards?name="+t_semana?.value+"&idList="+listPast+"&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
        .then(async (r: AxiosResponse<ReturnNewCard>) => {

            idCard = r.data.id

            await axios.post("https://api.trello.com/1/checklists?idCard="+idCard+"&name=Entregas"+"&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
            .then(async (r: AxiosResponse<ReturnNewChecklist>) => {

                idEntregas = r.data.id

                await axios.post("https://api.trello.com/1/checklists?idCard="+idCard+"&name=Tarefas"+"&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                .then(async (r: AxiosResponse<ReturnNewChecklist>) => {
            
                    idTarefas = r.data.id
            
                    await axios.post("https://api.trello.com/1/checklists?idCard="+idCard+"&name=Bloqueadas"+"&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                    .then(async (r: AxiosResponse<ReturnNewChecklist>) => {
                
                        idBloqueadas = r.data.id

                        let i = 4

                        progressBar.detail = "Finalizando Entregas..."

                        for (let e in Entregas) {

                            if (i >= 20) {

                                sleep(1)
                                i = 0

                            }

                            if (Entregas[e].marcada) {

                                await axios.post("https://api.trello.com/1/checklists/"+idEntregas+"/checkItems?name="+Entregas[e].nome+" ("+Entregas[e].pessoas.join(",")+")"+"&checked=true&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                await axios.delete("https://api.trello.com/1/cards/"+Entregas[e].id+"?key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

                            }
                            else {

                                await axios.post("https://api.trello.com/1/checklists/"+idEntregas+"/checkItems?name="+Entregas[e].nome+" ("+Entregas[e].pessoas.join(",")+")"+"&checked=false&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                            }

                            i += 2

                        }

                        console.log("Entregas pronto")

                        progressBar.detail = "Finalizando Tarefas..."

                        for (let e in Tarefas) {

                            if (i >= 20) {

                                sleep(1)
                                i = 0

                            }

                            if (Tarefas[e].marcada) {

                                await axios.post("https://api.trello.com/1/checklists/"+idTarefas+"/checkItems?name="+Tarefas[e].nome+" ("+Tarefas[e].pessoas.join(",")+")"+"&checked=true&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                await axios.delete("https://api.trello.com/1/cards/"+Tarefas[e].id+"?key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")

                            }
                            else {

                                await axios.post("https://api.trello.com/1/checklists/"+idTarefas+"/checkItems?name="+Tarefas[e].nome+" ("+Tarefas[e].pessoas.join(",")+")"+"&checked=false&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                            }

                            i += 2

                        }

                        console.log("Tarefas pronto")

                        progressBar.detail = "Finalizando Bloqueadas..."

                        for (let e in Bloqueadas) {

                            if (i >= 20) {

                                sleep(1)
                                i = 0

                            }

                            if (Bloqueadas[e].marcada) {

                                if (Bloqueadas[e].tipo == "Entrega") {

                                    await axios.post("https://api.trello.com/1/checklists/"+idBloqueadas+"/checkItems?name="+Bloqueadas[e].nome+" ("+Bloqueadas[e].pessoas.join(",")+") [Entrega]"+"&checked=true&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                    .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                }
                                else {

                                    await axios.post("https://api.trello.com/1/checklists/"+idBloqueadas+"/checkItems?name="+Bloqueadas[e].nome+" ("+Bloqueadas[e].pessoas.join(",")+") [Tarefa]"+"&checked=true&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                    .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                }

                            }
                            else {

                                if (Bloqueadas[e].tipo == "Entrega") {

                                    await axios.post("https://api.trello.com/1/checklists/"+idBloqueadas+"/checkItems?name="+Bloqueadas[e].nome+" ("+Bloqueadas[e].pessoas.join(",")+") [Entrega]"+"&checked=false&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                    .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                }
                                else {

                                    await axios.post("https://api.trello.com/1/checklists/"+idBloqueadas+"/checkItems?name="+Bloqueadas[e].nome+" ("+Bloqueadas[e].pessoas.join(",")+") [Tarefa]"+"&checked=false&key=c8055ea81e83e2f2aee0a17139667194&token=3a4b27878c8792aa5f2950fe40681bb4bfffb31331d6ebd94773e15b7e4985b4")
                                    .then((r: AxiosResponse<ReturnNewCheckOnCheckList>) => {})

                                }

                            }

                            i++

                        }

                        console.log("Bloqueadas pronto")

                        setTimeout(() => {

                            progressBar.setCompleted();

                        }, 1000)
                
                    })
                    .catch(e => {

                        console.log(e)
                        progressBar.close();

                    })

                })
                .catch(e => {

                    console.log(e)
                    progressBar.close();

                })

            })
            .catch(e => {

                console.log(e)
                progressBar.close();

            })

        })
        .catch(e => {

            console.log(e)
            progressBar.close();

        })

        if (select_user != undefined) {

            select_user.value = ""
            change_user()

        }

    })

    const time = electron.remote.getGlobal('time') as Time | string
    const userg = electron.remote.getGlobal('user') as User | string

    if (time != null && time != undefined) {

        if (select_team != undefined) {

            if (typeof(time) != "string") {

                select_team.value = time.name
                change_team()

                electron.ipcRenderer.send("SetTime", "")

            }
            else {

                select_team.value = ""
                change_team()

            }

        }

    }

    if (userg != null && userg != undefined) {

        if (select_user != undefined) {

            if (typeof(userg) != "string") {

                select_user.value = userg.name
                change_user()

                electron.ipcRenderer.send("SetUser", "")

            }
            else {

                select_user.value = ""
                change_user()

            }

        }

    }

}