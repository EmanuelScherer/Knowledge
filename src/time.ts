import * as electron from 'electron'

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

const time = electron.remote.getGlobal('time') as string

const membros = document.querySelector('div#membros') as HTMLDivElement
const nome = document.querySelector('h2#Nome_Time') as HTMLHeadingElement
const bt_tarefas = document.querySelector('button#tarefas') as HTMLButtonElement

nome.textContent = time

for (let t in login.teams) {

    if (login.teams[t].name == time) {

        for (let u in login.teams[t].users) {

            const bt = document.createElement('input')

            bt.type = "button"
            bt.name = login.teams[t].users[u].name
            bt.value = login.teams[t].users[u].name
            bt.className = "big fit alt"

            membros.appendChild(bt)

        }

    }

}

bt_tarefas.addEventListener('click', () => {

    electron.ipcRenderer.send('SetTime', time)
    electron.remote.getGlobal('win').loadFile('./html/meeting.html')

})

electron.ipcRenderer.send('SetTime', "")