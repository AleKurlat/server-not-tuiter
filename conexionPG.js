//const settings = require("./settingsPGlocal.json");
const settings = require("./settingsPG.json");
const { Client } = require("pg");

module.exports = {
    conectar: function (){
        const client = new Client (settings); 
        client.connect();
        console.log("Conexion con base de datos establecida");
        return client;
    }
}