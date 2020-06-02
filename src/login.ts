import * as electron from 'electron';
import Swal from 'sweetalert2';
import axios, { AxiosResponse } from 'axios'
import * as fs from 'fs'
import {Time, Login, User} from '../utils/tipos'

const bd = require('../DataBase/connect.js')
const nodemailer = require('nodemailer')

const form_login: HTMLFormElement | null = document.querySelector("form#login")

const win = electron.remote.getGlobal('win') as electron.BrowserWindow

const Input_Login: HTMLInputElement | null = document.querySelector("input#InpLogin")
const Input_Senha: HTMLInputElement | null = document.querySelector("input#InpSenha")

console.log(electron.remote.getGlobal('app').getAppPath())

const esqueci = document.querySelector("a#esqueci") as HTMLLinkElement

let b = false

let LoginCookie = ""

electron.ipcRenderer.send("SetLogin", undefined)

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

esqueci.addEventListener("click", () => {

    Swal.mixin({
        confirmButtonText: 'Enviar',
        showCancelButton: false,
    }).queue([
        {
            input: "email",
            title: "Recuperação de senha",
            text: "Digite o email da conta",
            icon: "info",
            validationMessage: "Email invalido"
        }
    ]).then(r => {

        if (r.value != undefined) {

            bd.GetUser(r.value[0])
            .then((user: User) => {

                if (user.existe) {

                    let html = fs.readFileSync(electron.remote.getGlobal('app').getAppPath()+"/html/components/email.html", "utf-8")

                    console.log(html)

                    let transporter = nodemailer.createTransport({
                        host: "smtp-mail.outlook.com", // hostname
                        secureConnection: false, // TLS requires secureConnection to be false
                        port: 587, // port for secure SMTP
                        tls: {
                        ciphers:'SSLv3'
                        },
                        auth: {
                            user: 'emanuel.scherer@meta.com.br',
                            pass: 'qUkS@Skv1'
                        }
                    });
        
                    let mailOptions = {
                        from: 'Knowledge <emanuel.scherer@meta.com.br>', // sender address (who sends)
                        to: user.email, // list of receivers (who receives)
                        subject: 'Recuperação de senha knowledge', // Subject line
                        //text: 'teste', // plaintext body
                        html: html // html body
                    };
        
                    transporter.sendMail(mailOptions, (error: any, info: any) => {
                        if(error){
                            return console.log(error);
                        }
                    
                        console.log('Message sent: ' + info.response);
                    });

                }

                Swal.fire('Recuperação de senha', 'Se existir um login com o email digitado será enviado uma mensagem com a nova senha', 'info')

            })

        }

    })

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