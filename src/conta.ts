import * as electron from 'electron'
import Swal from 'sweetalert2'

interface OConfig {

    "name": string,

    "area": string,

    "login": {

        "email": string,
        "senha": string,
        "trello": string

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

                    },
                    {

                        "name": "Past",
                        "id": ""

                    }

                ]

            },

            "users": [

                {

                    "name": string

                    "id": string

                }

            ]

        }

    ]

}

const login = electron.remote.getGlobal('login') as OConfig

if (login == undefined || login == null) {
    Swal.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
        .then(() => {
            electron.remote.getGlobal('win').loadFile('./html/login.html');
    });
}
else {

    const nome: HTMLInputElement = document.querySelector("input#nome") as HTMLInputElement
    const area: HTMLInputElement = document.querySelector("input#area") as HTMLInputElement
    const email: HTMLInputElement = document.querySelector("input#email") as HTMLInputElement
    const senha: HTMLInputElement = document.querySelector("input#senha") as HTMLInputElement
    const trello: HTMLInputElement = document.querySelector("input#trello") as HTMLInputElement

    nome.value = login.name
    area.value = login.area
    email.value = login.login.email
    senha.value = login.login.senha
    trello.value = login.login.trello

    const times = document.querySelector("div#times") as HTMLDivElement

    for (let t in login.teams) {

        const bt = document.createElement("input")

        bt.type = "button"
        bt.name = login.teams[t].name
        bt.value = login.teams[t].name
        bt.className = "big fit"

        bt.addEventListener("click", () => {

            electron.ipcRenderer.send('SetTime', login.teams[t])
            electron.remote.getGlobal('win').loadFile('./html/time.html')

        })

        times.appendChild(bt)

    }

}