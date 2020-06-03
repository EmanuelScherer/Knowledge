module.exports = class Team {

    constructor(teamData, name) {
        this._teamName = name
        this._board = teamData.trello.mapValue.fields.board.stringValue;
        this._lists = this.getLists(teamData.trello.mapValue.lists.arrayValue.values)
    }

    getTeamName(){
        return this._teamName;
    }

    getBoard(){
        return this._board;
    }

    getLists(teamData) {
        let lists = []
        
        for (i in teamData) {
            list = {
                id: teamData[i].mapValue.fields.id,
                name: teamData[i].mapValue.fields.name
            }
            lists.push(list)
        }

        return (lists)
    }

    generateTeamJSON() {
        return {
            name: this._teamName,
            trello: {
                board: this._board,
                lists: this._lists,
            }
        }
    }

}