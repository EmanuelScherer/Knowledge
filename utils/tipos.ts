export interface Login {

    "name": string,

    "area": string,

    "acesso": 1 | 2 | 3 | 4 | 5

    "login": {

        "email": string,
        "senha": string,
        "oneUse": true,
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

                    "login": string

                    "cargo": "Membro" | "ADM"

                }

            ]

        }

    ]

}

export interface User {

    "existe": boolean,

    "name": string,

    "area": string,

    "email": string,

    "acesso": 1 | 2 | 3 | 4 | 5

    "teams": [

        {

            "name": string
            
        }

    ]   

}

export interface Time {

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
            "login": string,
            "cargo": "Membro" | "ADM"
        }

    ]

}

export interface Users {

    "name": string,
    "login": string,
    "area": string
    "acesso": 1 | 2 | 3 | 4 | 5

}