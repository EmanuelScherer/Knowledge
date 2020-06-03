const admin = require('firebase-admin');
const axios = require('axios')
const serviceAccountGCP = require('../DataBase/serviceAccountGCP.json');
const con = require('electron').remote.getGlobal('console')

function dataBase () {
    this._db = admin.firestore();
    this._request = axios;
}

dataBase.prototype.getUserData = async function (email) {
        
    return new Promise(async (resolve) => {
        let headers = {
            'Authorization' : 'Bearer ya29.c.Ko8BzQdoLHiMJisCfmT93QRRLgioQlqQfi4aImz2himd1I3M7wnqVYzorQ9Yb0krz4YpR6DShXL6iKokyTfGdrDJwiJp5Sj-WqMlS6Og20n5qogZE-LA7UC9PvhifLLSKV2oREqQZRINgP213-xR-OaPjzDZu4AvWi9dE1nX-lWJBMue03fxS7JzQ7RnidjTQp0'
        }

        await axios.get('https://firestore.googleapis.com/v1/projects/planar-acronym-275514/databases/(default)/documents/KM_User_Profile/'+ email, {headers: headers})
        .then(result => {
            con.log(result)
            con.log()
            resolve({request: true, data: result.data.fields})
            return {request: true, data: result.data.fields}
        })
        .catch(err => {
            if (err.response.status == 404) {
                resolve({request: false})
                return {request: false}
            }

            resolve({request: false})
            return {request: false}
        })
    })

}

dataBase.prototype.authenticateUser =  async function (email, senha) {
        
    return new Promise (async (resolve) => {
        await this.getUserData(email)
        .then(userData => {
            if (userData.request){
                let registeredPassword = userData.data.login.mapValue.fields.password.stringValue;

                if (senha == registeredPassword) {

                    resolve ({exists: true, userData: userData})
                    return {exists: true, userData: userData}
                }

                resolve ({exists: false})
                return {exists: false}

            } else {

                resolve ({exists: false})
                return {exists: false}
            }
      
        })
        .catch(err => {
            con.log("Erro aqui no auth, tá ok?")
        })
    })
}

dataBase.prototype.getTeam = async function(name) {

    return new Promise (async (resolve) => {

        let headers = {
            'Authorization' : 'Bearer ya29.c.Ko8BzQdoLHiMJisCfmT93QRRLgioQlqQfi4aImz2himd1I3M7wnqVYzorQ9Yb0krz4YpR6DShXL6iKokyTfGdrDJwiJp5Sj-WqMlS6Og20n5qogZE-LA7UC9PvhifLLSKV2oREqQZRINgP213-xR-OaPjzDZu4AvWi9dE1nX-lWJBMue03fxS7JzQ7RnidjTQp0'
        }

        await axios.get('https://firestore.googleapis.com/v1/projects/planar-acronym-275514/databases/(default)/documents/KM_Teams/'+ name, {headers: headers})
        .then(team => {
            resolve(team.fields)
            return team.fields
        })
        .catch(error => {
            throw error
        })


        
    })
}

module.exports = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountGCP)
    });

    return dataBase;
}


 // let uid = 'login'

            // let customToken;
            // await admin.auth().createCustomToken(uid)
            // .then(tokenGenerated => {
            //     con.log(tokenGenerated)
            //     customToken = tokenGenerated;
            // })
            
            // let headers = {
            //     "Content-Type": "application/json"
            // }

            // let body = {
            //     "token": customToken,
            //     "returnSecureToken": true
            // }

            // await axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyCSOZ4_tr-IVK48XrPKWP3cyJ9LoG54OX0', body, {headers: headers} )
            // .then(result => {
            //     con.log(result)
            // })
            // .catch(error => {
            //     con.log(error)
            // })