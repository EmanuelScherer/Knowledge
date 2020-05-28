import * as electronObri from 'electron'
import SwalObri from 'sweetalert2'

interface OConfig {

    "name": string,

    "area": string,

    "login": {

        "email": string,
        "senha": string,
        "oneUse": boolean,
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

const login = electronObri.remote.getGlobal('login') as OConfig

if (login == undefined || login == null) {

    SwalObri.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
    .then(() => {

        electronObri.remote.getGlobal('win').loadFile('./html/login.html')

    })

}
else {

    if (login.login.oneUse) {

        SwalObri.fire('Senha de uso unico', 'A senha usada é de uso unico, por favor crie uma nova senha', 'info')
        .then(() => {

            electronObri.remote.getGlobal('win').loadFile('./html/conta.html')

        })

    }

    if (login.login.trello == "" || login.login.trello == null || login.login.trello == undefined) {

        SwalObri.fire('Sem trello configurado', 'A sua conta não possui trello vinculado, por favor vincule seu trello', 'info')
        .then(() => {

            electronObri.remote.getGlobal('win').loadFile('./html/conta.html')

        })

    }

}