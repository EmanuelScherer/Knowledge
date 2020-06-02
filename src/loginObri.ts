import * as electronObri from 'electron'
import * as SwalObri from 'sweetalert2'
import {Time, Login, User} from '../utils/tipos'

const loginObri = electronObri.remote.getGlobal('login') as Login

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