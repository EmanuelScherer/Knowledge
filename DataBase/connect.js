module.exports = {

    Login: () => {



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
    
    }

}