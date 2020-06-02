module.exports = {

    Login: (login, senha) => {

        return new Promise((resolve) => {

            //Codigo q confima
    
            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\InovTeam.json") // <---- Const com o JSON do login
    
            resolve({ok: true, login: json}) // <----- ok e se o login ta certo (true -> s, false -> n)
    
        })

    },
    
    GetUser: (name) => {
    
        return new Promise((resolve) => {
    
            //Codigo q pega o usuario
    
            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\ExemploUser.json") // <---- Const com o JSON do usuario
    
            resolve(json)
    
        })
    
    },
    
    GetTeam: (name) => {
    
        return new Promise((resolve) => {
    
            //Codigo q pega o time
    
            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\ExemploTeam.json") // <---- Const com o JSON do time
    
            resolve(json)
    
        })
    
    },

    GetUsers: () => {

        return new Promise((resolve) => {

            //Codigo q pega todos os usuarios

            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\ExemploUsers.json") // <---- Const com o JSON dos usuarios

            resolve(json)

        })            

    }

}