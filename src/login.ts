import * as electron from 'electron';
import Swal from 'sweetalert2';
import axios, { AxiosResponse } from 'axios'

const bd = require('../DataBase/connect.js')

const form_login: HTMLFormElement | null = document.querySelector("form#login")

const win = electron.remote.getGlobal('win') as electron.BrowserWindow

const Input_Login: HTMLInputElement | null = document.querySelector("input#InpLogin")
const Input_Senha: HTMLInputElement | null = document.querySelector("input#InpSenha")

let b = false

let LoginCookie = ""

electron.remote.session.defaultSession.cookies.get({name: 'login'}).then((Cookies) => {
    
    const r = Cookies[0].value.split(",")

    if (Input_Login != undefined && Input_Senha != undefined) {

        Input_Login.value = r[0]
        Input_Senha.value = r[1]

        LoginCookie = r[0]

    }

    b = true

})

electron.remote.session.defaultSession.cookies.get({}).then((Cookies) => {
    
    console.log(Cookies)

})

form_login?.addEventListener('submit', async (e) => {

    e.preventDefault()

    const login: string | undefined = Input_Login?.value
    const senha: string | undefined = Input_Senha?.value

    if (login == undefined) {

        Swal.fire('Erro', 'O login não pode ser pego', 'error')
        return false

    }
    else if (senha == undefined) {

        Swal.fire('Erro', 'A senha não pode ser pega', 'error')
        return false

    }
    else {

        if (b) {

            if (Input_Login?.value == LoginCookie) {

                await bd.Login(login, senha).then((r: any) => {

                    if (r.ok) {

                        electron.ipcRenderer.send('SetLogin', r.login)
                        win.loadFile('./html/index.html')

                    }
                    else {

                        Swal.fire('Erro', 'Login e/ou Senha errado(s)', 'error')

                    }

                })

            }
            else {

                await bd.Login(login, senha).then((r: any) => {

                    if (r.ok) {

                        electron.ipcRenderer.send('SetLogin', r.login)
                        electron.remote.session.defaultSession.cookies.set({name: 'login', value: login+","+senha, url: "https://www.google.com/", expirationDate: 30 * 24 * 60 * 60 * 1000, secure: true}).then(() => win.loadFile('./html/index.html'))

                    }
                    else {

                        Swal.fire('Erro', 'Login e/ou Senha errado(s)', 'error')

                    }

                })

            }

        }
        else {

            await bd.Login(login, senha).then((r: any) => {

                if (r.ok) {

                    electron.ipcRenderer.send('SetLogin', r.login)
                    electron.remote.session.defaultSession.cookies.set({name: 'login', value: login+","+senha, url: "https://www.google.com/", expirationDate: 30 * 24 * 60 * 60 * 1000, secure: true}).then(() => win.loadFile('./html/index.html'))

                }
                else {

                    Swal.fire('Erro', 'Login e/ou Senha errado(s)', 'error')

                }

            })

        }

        //electron.remote.session.defaultSession.cookies.remove('https://www.google.com/', 'aaa')

    }

})