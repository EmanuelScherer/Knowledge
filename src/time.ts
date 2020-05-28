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

    //const login = electron.remote.getGlobal('login') as OConfig

    const time = electron.remote.getGlobal('time') as Time

    const membros = document.querySelector('div#membros') as HTMLDivElement
    const nome = document.querySelector('h2#Nome_Time') as HTMLHeadingElement
    const bt_tarefas = document.querySelector('button#tarefas') as HTMLButtonElement

    nome.textContent = time.name

    for (let u in time.users) {

        const bt = document.createElement('input')

        bt.type = "button"
        bt.name = time.users[u].name
        bt.value = time.users[u].name
        bt.className = "big fit alt"

        bt.addEventListener('click', () => {

            bd.GetUser(time.users[u].login)
            .then((r: User) => {

                electron.ipcRenderer.send("SetUser", r)
                electron.remote.getGlobal('win').loadFile("./html/user.html")

            })

        })

        membros.appendChild(bt)

    }

    bt_tarefas.addEventListener('click', () => {

        electron.ipcRenderer.send('SetTime', time)
        electron.remote.getGlobal('win').loadFile('./html/meeting.html')

    })

    electron.ipcRenderer.send('SetTime', "")

}