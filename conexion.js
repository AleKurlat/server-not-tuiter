const mysql = require("mysql");
const util = require ("util");

const conexion = mysql.createConnection({
    host: "localhost", 
    user: "root",
    password: "", 
    database: "login"
});

conexion.connect((error)=>{
    if(error){throw error;} 
    console.log("Conexión con la base de datos establecida");
})

module.exports = util.promisify(conexion.query).bind(conexion);