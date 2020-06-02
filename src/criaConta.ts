import * as electron from 'electron';
import Swal from 'sweetalert2';

import {Time, Login, User, Users} from '../utils/tipos'

const bd = require("../DataBase/connect.js")

const login = electron.remote.getGlobal('login') as Login

const nome = document.querySelector("input#nome") as HTMLInputElement
const area = document.querySelector("input#area") as HTMLInputElement

const btAdd = document.querySelector('button#AddTime') as HTMLButtonElement

const form = document.querySelector("form#NovaConta") as HTMLFormElement

const divTimes = document.querySelector("div#times") as HTMLDivElement

area.value = login.area

let Times: string[] = []

btAdd.addEventListener('click', () => {

    let t: {[key: string]: string} = {}

    for (let i in login.teams) {

        for (let u in login.teams[i].users) {

            if (login.teams[i].users[u].name == login.name && login.teams[i].users[u].cargo == "ADM") {

                t[login.teams[i].name] = login.teams[i].name

            }

        }

    }

    Swal.mixin({
        
        input: "select",
        inputOptions: t

    })
    .queue([{

            title: "Adicionar time ao usuario",
            text: "selecione um time",
            icon: "question"

        }
    ])
    .then(r => {

        if (r != undefined && r.value != undefined && r.value != "" && r.value != null) {

            Times.push(r.value[0])

            const bt = document.createElement("button")

            bt.type = "button"
            bt.className = "big fit"
            bt.textContent = r.value[0]

            divTimes.appendChild(bt)

            bt.addEventListener('click', () => {

                Swal.fire({

                    title: "Remover time?",
                    text: "Tem certeza que quer remover "+r.value[0]+" do usuario?",
                    
                    showCancelButton: true,

                    confirmButtonText: "Sim",
                    cancelButtonText: "Não",

                })
                .then(r => {

                    if (r != undefined && r.value != undefined) {

                        if (r.value) {

                            divTimes.removeChild(bt)
                            
                            Times.splice(Times.indexOf(r.value[0]), 1)

                        }

                    }

                })

            })

        }

    })

})

form.addEventListener('submit', (e) => {

    e.preventDefault()

    // CODIGO CRIA CONTA

    //electron.ipcRenderer.send('SetUser', )

    electron.remote.getGlobal('win').loadFile("./html/user.html")

})