import * as electron from 'electron';
import Swal from 'sweetalert2';

import {Time, Login, User, Users} from '../utils/tipos'

const bd = require("../DataBase/connect.js")

const login = electron.remote.getGlobal('login') as Login

const nome = document.querySelector("input#nome") as HTMLInputElement
const area = document.querySelector("input#area") as HTMLInputElement

const userADM = document.querySelector("button#UserADM") as HTMLButtonElement
const btAdd = document.querySelector('button#AddMember') as HTMLButtonElement

const form = document.querySelector("form#NovoTime") as HTMLFormElement

const divMembros = document.querySelector("div#membros") as HTMLDivElement

area.value = login.area
userADM.textContent = login.name

interface Membro {

    nome: string
    login: string,
    cargo: string

}

let Membros: Membro[] = []
Membros.push({nome: login.name, login: login.login.email, cargo: "ADM"})

btAdd.addEventListener('click', () => {

    bd.GetUsers()
    .then((r: Users[]) => {

        let u: {[key: string]: string;} = {}

        console.log(Membros)

        for (let i in r) {

            let b = true

            for (let m in Membros) {

                if (Membros[m].login == r[i].login) {

                    b = false
                    break

                }

            }

            if (b) {

                u[r[i].login+","+r[i].name+","+i] = r[i].name

            }

        }

        Swal.mixin({

            input: "select",
            inputOptions: u

        })
        .queue([{

            title: "Adicionar membro no time",
            text: "Selecione o membro a ser adiciona",
            icon: "info"

        }])
        .then(rr => {

            if (rr != undefined) {

                const split = rr.value[0].split(",").join().split(",")

                const bt = document.createElement("button")

                bt.className = "big fit"
                bt.textContent = split[1]
                bt.type = "button"

                const i = 

                bt.addEventListener('click', () => {

                    Swal.fire({

                        title: "Remover membro?",
                        text: "Tem certeza que quer remover "+split[1]+" do time?",
                        
                        showCancelButton: true,

                        confirmButtonText: "Sim",
                        cancelButtonText: "Não",

                    })
                    .then(r => {

                        if (r != undefined) {

                            if (r.value) {

                                divMembros.removeChild(bt)
                                
                                Membros.splice(parseInt(split[2]), 1)

                            }

                        }

                    })

                })

                Membros.push({nome: split[1], login: split[0], cargo: "Membro"})

                divMembros.appendChild(bt)

            }

        })

    })

})

form.addEventListener('submit', (e) => {

    e.preventDefault()

    // CODIGO CRIA TIME

    //electron.ipcRenderer.send('SetTime', )

    electron.remote.getGlobal('win').loadFile("../html/time.html")

})