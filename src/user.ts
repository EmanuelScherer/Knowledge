import * as electron from 'electron'

const bd = require('../DataBase/connect.js')

interface User {

    "name": string,

    "area": string,

    "email": string,

    "teams": [

        {

            "name": string
            
        }

    ]   

}

interface Time {

    "name": string,
    
    "trello": {

        "board": string,
        
        "lists": [

            {

                "name": "To Do",
                "id": string

            },
            {

                "name": "Doing",
                "id": string

            },
            {

                "name": "Done",
                "id": string

            },
            {

                "name": "Blocked",
                "id": string

            },

            {

                "name": "Deliveries",
                "id": string

            },

            {

                "name": "Past",
                "id": string

            }

        ]

    },

    "users" : [

        {
            "name": string,
            "id": string,
            "login": string
        }

    ]

}

const user = electron.remote.getGlobal('user') as User

const nome = document.querySelector("h2#nome") as HTMLHeadingElement
const times = document.querySelector("div#times") as HTMLDivElement
const tarefas_subtitulo = document.querySelector("p#tarefas_subtitulo") as HTMLParagraphElement
const tarefas = document.querySelector("div#tarefas") as HTMLDivElement

nome.textContent = user.name
tarefas_subtitulo.textContent = "Visualizar as tarefas de "+user.name

for (let t in user.teams) {

    const bt_time = document.createElement("button")
    const bt_tarefa = document.createElement("button")

    bt_time.textContent = user.teams[t].name
    bt_time.className = "big special"
    
    bt_tarefa.textContent = user.teams[t].name
    bt_tarefa.className = "big special"

    bt_time.addEventListener('click', () => {

        bd.GetTeam(user.teams[t].name)
        .then((r: Time) => {

            electron.ipcRenderer.send('SetTime', r)
            electron.remote.getGlobal('win').loadFile('../html/time.html')

        })

    })


}