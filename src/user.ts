import * as electron from 'electron'
import Swal from 'sweetalert2'

const login = electron.remote.getGlobal('login')

if (login == undefined || login == null || login == {}) {
    Swal.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
        .then(() => {
            electron.remote.getGlobal('win').loadFile('./html/login.html');
    });
}
else {

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

        for (let tt in login.teams) {

            if (login.teams[tt].name == user.teams[t].name) {

                const bt_tarefa = document.createElement("input")

                bt_tarefa.type = "button"
                bt_tarefa.value = user.teams[t].name
                bt_tarefa.className = "big alt fit"

                bt_tarefa.addEventListener('click', () => {

                    bd.GetTeam(user.teams[t].name)
                    .then((time: Time) => {

                        bd.GetUser(user.name)
                        .then((user: User) => {

                            electron.ipcRenderer.send('SetTime', time)
                            electron.ipcRenderer.send('SetUser', user)
                            electron.remote.getGlobal('win').loadFile('./html/meeting.html')

                        })

                    })

                })

                tarefas.appendChild(bt_tarefa)

                break

            }

        }

        const bt_time = document.createElement("input")

        bt_time.type = "button"
        bt_time.value = user.teams[t].name
        bt_time.className = "big special fit"

        bt_time.addEventListener('click', () => {

            bd.GetTeam(user.teams[t].name)
            .then((r: Time) => {

                electron.ipcRenderer.send('SetTime', r)
                electron.remote.getGlobal('win').loadFile('./html/time.html')

            })

        })

        times.appendChild(bt_time)

    }

}