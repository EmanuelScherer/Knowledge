const userClass = require('../DataBase/userClass.js')()
const Team = require('../DataBase/teamClass.js')
const dbConnection = require('../DataBase/dbConnection.js')()
const con = require('electron').remote.getGlobal('console')

const db = new dbConnection()

module.exports = {

    Login: (email, senha) => {

        return new Promise(async (resolve) => {

            await db.authenticateUser(email, senha)
            .then(result => {
                con.log(result)
                if (result.exists) {
                    let User = new userClass(result.userData.data)
                    let userJSON = User.generateUserJSON()
                    resolve({ok: true, login: userJSON})
                    return true
                }
                resolve(false)
                return false
            })

        })
            

    },
    
    GetUser: (email) => {
    
        return new Promise(async (resolve) => {
            
            await db.getUserData(email)
            .then(userData => {
                if (userData.request) {
                    let User = new userClass(userData.data)
                    let userJSON = User.generateUserJSON()
                    resolve(userJSON)
                    return userJSON
                }
                resolve(false)
                return false

            })
    
        })
    
    },
    
    GetTeam: (name) => {
    
        return new Promise(async (resolve) => {
    
            await db.getTeam(name)
            .then(teamData => {
                let team = new Team(teamData, name);
                let teamJSON = team.generateTeamJSON();

                resolve(teamJSON);
                return teamJSON;
            })
            .catch(err => {
                con.log(err)
                resolve(false)
                return(false)
            })
    
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