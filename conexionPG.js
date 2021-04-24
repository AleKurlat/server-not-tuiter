const { Client } = require("pg");
const settingsPGLocal = require("./settingsPGlocal.json");
const settingsPGRemoto = {            
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

module.exports = {
    conectar: function (){
        let client = "";
        if(process.env.PORT){
          client = new Client(settingsPGRemoto);
          console.log("Operando en servidor remoto");
        } else {
          client = new Client (settingsPGLocal);
          console.log("Operando en servidor local");
        }                      
        client.connect(err => {
          if (err) {
            console.error('Error al conectar con la base de datos', err.stack);
          } else {
            console.log('Conexion con base de datos establecida');
          }
        })
        return client;
    }
}