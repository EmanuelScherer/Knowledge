import * as electron from 'electron'
import Swal from 'sweetalert2'
import {Time, Login, User} from '../utils/tipos'

const login = electron.remote.getGlobal('login') as Login

const btCriaConta = document.querySelector("button#CriaConta") as HTMLButtonElement

console.log(login.acesso);

if (login.acesso <= 1) {

    Swal.fire("Não autorizado", "Você não é autorizado a ver essa pagina", "error")
    .then(() => {

        electron.remote.getGlobal('win').loadFile("./html/index.html")

    })

}

btCriaConta?.addEventListener('click', () => {

    electron.remote.getGlobal('win').loadFile("./html/CriarConta.html")

})