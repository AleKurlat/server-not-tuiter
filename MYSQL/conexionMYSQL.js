const mysql = require("mysql");
const util = require ("util");
const settings= require("./settingsMYSQL.json");

const conexion = mysql.createConnection(settings);

conexion.connect((error)=>{
    if(error){throw error;} 
    console.log("Conexión con la base de datos establecida");
})

module.exports = util.promisify(conexion.query).bind(conexion);