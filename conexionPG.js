//const settings = require("./settingsPGlocal.json");
const { Client } = require("pg");

module.exports = {
    conectar: function (){
        //const client = new Client (settings);
        const client = new Client({            
            connectionString: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false
            }
          }) 
        client.connect();
        console.log("Conexion con base de datos establecida");
        return client;
    }
}