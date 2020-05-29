import * as electronObri from 'electron'
import * as SwalObri from 'sweetalert2'

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

const loginObri = electronObri.remote.getGlobal('login') as OConfig

if (loginObri == undefined || loginObri == null) {

    SwalObri.default.fire('Não autenticado', 'Você deve entrar na sua conta para ver essa pagina', 'warning')
    .then(() => {

        electronObri.remote.getGlobal('win').loadFile('./html/login.html')

    })

}
else {

    if (loginObri.login.oneUse) {

        SwalObri.default.fire('Senha de uso unico', 'A senha usada é de uso unico, por favor crie uma nova senha', 'info')
        .then(() => {

            electronObri.remote.getGlobal('win').loadFile('./html/conta.html')

        })

    }

    if (loginObri.login.trello == "" || loginObri.login.trello == null || loginObri.login.trello == undefined) {

        SwalObri.default.fire('Sem trello configurado', 'A sua conta não possui trello vinculado, por favor vincule seu trello', 'info')
        .then(() => {

            electronObri.remote.getGlobal('win').loadFile('./html/conta.html')

        })

    }

}