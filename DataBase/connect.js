const admin = require('firebase-admin');
const axios = require('axios')
const serviceAccountGCP = require('../DataBase/serviceAccountGCP.json');

//Autenticação no Firestore
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountGCP)
});

//Inicia cliente no Firestore
const firestore = admin.firestore();

const con = require('electron').remote.getGlobal('console')

module.exports = {

    Login: (login, senha) => {

        return new Promise(async (resolve) => {

            headers = {
                'Authorization' : 'Bearer ya29.c.Ko8BzQd-uckqYd21K3FolieVDJlV7EiSXMXBpngfhxWjxkCfDlUBt2_YsLfR9wf49u1K_p2-zTKdNjZnZ2NB7hKQCma32PZIaFve8viZoc3KJPeM96u8KCtY2pPmxya041jxmrwPeFz-59-CDWL4H0VAY2dKrk9tBwBCRyuNXR0TL19MY_MxFSH2BBssYD_tLbk'
            }

            await axios.get('https://firestore.googleapis.com/v1/projects/planar-acronym-275514/databases/(default)/documents/KM_User_Profile/'+login, {headers: headers})
            .then(result =>{
                con.log(typeof(result))
                if (senha == result.data.fields.login.mapValue.fields.password.stringValue) {
                    con.log("Senha correta")
                }
            })
            .catch(error => {
                if (error.response.status == 404) {
                    resolve(false)
                    return false
                } else if (error.request) {
                    con.log(error.request);
                } else {
                    con.log('Error', error.message);
                }
            })


            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\InovTeam.json") // <---- Const com o JSON do login

            resolve({ok: true, login: json}) // <----- ok e se o login ta certo (true -> s, false -> n)
        })
            

    },
    
    GetUser: (email) => {
    
        return new Promise(async (resolve) => {
            
            let userKMProfile;
            let userKMProfileQuery = db.collection('KM_User_Profile').doc(email)
            await userKMProfileQuery.get()
            .then(doc => {
                if(!doc.exists) {
                    con.log("N tem essa porra")
                    resolve(false)
                    return false
                } else {
                    userKMProfile = doc.data()
                }
            })
            con.log(userKMProfile)
            const json = require(electron.remote.getGlobal('app').getAppPath()+"\\configs\\ExemploUser.json") // <---- Const com o JSON do usuario
    
            resolve(json)
    
        })
    
    },
    
    GetTeam: (name) => {
    
        return new Promise((resolve) => {
    
            let teamKMProfileQuery = db.collection('KM_Teams').doc()
    
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