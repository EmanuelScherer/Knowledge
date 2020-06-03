const con = require('electron').remote.getGlobal('console')

function User(userData){

    this._name = userData.name.stringValue;
    this._area = userData.area.stringValue;
    this._email = userData.login.mapValue.fields.email.stringValue;
    this._acesso = userData.acesso.integerValue;
    this._teams = userData.teams.arrayValue.values

}

User.prototype.getTeams = function () {

    let arrayTeams = []
    let team;
    for (i in this._teams) {
        team = {
            "name" : this._teams[i].stringValue
        }
        arrayTeams.push(team)
    }
    return arrayTeams;
}

User.prototype.generateUserJSON = function () {
    return {
        "existe": true,
        "name": this._name,
        "area": this._area,
        "email": this._email,
        "acesso": this._acesso,
        "teams": this.getTeams()
    }
}

module.exports = () => {
    return User;
};
