//APP LOGIN

// requiero módulos y establezco conexión con base de datos

const express = require("express");
const jwt = require("jsonwebtoken");
const unless = require("express-unless");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const util = require ("util");
const cors = require('cors');

const app = express();
const port = process.env.PORT ? process.env.PORT : 3001; // estructura ternaria, un IF completo, se asigna a variable un valor u otro según si se cumple, el signo de pregunta consulta si existe, si no existe hace lo otro

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: "localhost", 
    user: "root",
    password: "", 
    database: "login"
});

conexion.connect((error)=>{
    if(error){throw error;} 
    console.log("Conexión con la base de datos establecida");
});

const qy = util.promisify(conexion.query).bind(conexion); // permite el uso de async-away en la conexion con mysql

//establezco middleware de autenticación

const auth = (req, res, next) => {
    try{
        let token = req.headers["authorization"];
        if(!token){
            throw new Error("no estas logueado");
        }

        token = token.replace("Bearer ", "");

        jwt.verify(token, "Secret", (err, user) => {
            if (err) {
                throw new Error("Token invalido")
            }
        });

        next();
    }

    catch(e) {
        res.status(403).send({message: e.message});
    }

} // termina middleware de autenticación

auth.unless = unless; // defino método de excepción al middleware de autenticación

// llamo a método de excepción al middleware de autenticación, que se interpone antes de hacer cualquier cosa
app.use(auth.unless({
    path: [
        {url : "/login", methods: ["POST"]}, //es un array porque podria usar varios metodos separadas por comas
        {url : "/registro", methods: ["POST"]},
    ]
})); 

// paso 1 registración
app.post("/registro", async (req, res)=>{
    try{
        if(!req.body.usuario || !req.body.clave || !req.body.email || !req.body.cel) {
            throw new Error ("No enviaste todos los datos necesarios");
        }

        //valido que el usuario no esté ya en la base de datos
        let query = "SELECT * FROM usuarios WHERE email = ?";
        let respuesta = await qy(query, [req.body.email]);        
        if (respuesta.length > 0) {
            throw new Error ("Ya existe un usuario con ese correo electrónico");
        }
        query = "SELECT * FROM usuarios WHERE usuario = ?";
        respuesta = await qy(query, [req.body.usuario]);        
        if (respuesta.length > 0) {
            throw new Error ("Ya existe un usuario con ese nombre");
        }
        
        // si esta todo bien, encripto la clave
        const claveEncriptada = await bcrypt.hash(req.body.clave, 10); // es asincronica asi que hay que agregarle siempre async al POST

        // Guardo el nuevo registro con la clave encriptada y le muestro al usuario los otros datos
        query = "INSERT INTO usuarios (usuario, clave, email, cel) VALUE (?, ?, ?, ?)";
        respuesta = await qy(query, [req.body.usuario, claveEncriptada, req.body.email, req.body.cel]);
        let idAgregado = respuesta.insertId;
        query = "SELECT usuario, email, cel from usuarios WHERE id = ?";
        respuesta = await qy(query, [idAgregado]); 
        res.json(respuesta[0]);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

// paso 2 login

app.post("/login", async (req, res)=> {
    try {
        if(!req.body.usuario || !req.body.clave) {
            throw new Error ("No enviaste todos los datos necesarios");
        }

        //paso 1: busco el usuario en base de datos
        let query = "SELECT * from usuarios where usuario = ?";
        let respuesta = await qy(query, [req.body.usuario]);
        if(respuesta.length == 0){
            throw new Error("Ha ingresado un usuario que no existe");
        } 

        // Paso 2: verificar que clave ingresada coincida con la encriptada en base de datos

        const recuperarClaveEncriptada = respuesta[0].clave;
        if(!bcrypt.compareSync(req.body.clave, recuperarClaveEncriptada)){
            throw new Error("Ha ingresado incorrectamente la clave");
        }

        // paso 3: sesion
        const tokenData = {
            usuario: respuesta[0].usuario,
            email: respuesta[0].email,
            user_id: respuesta[0].id
        } // equivale a pulsera de reconocimiento en festivales

        const token = jwt.sign(tokenData, "Secret", {
            expiresIn : 60 * 60 * 24 // expira en 24 hs
        })
        res.send({token});
    }

    catch(e){
        res.status(413).send({message: e.message});
    }
});

// Si se envía un GET a localhost/ con Authorization como Key y el token como Header, retorna que el logueo fue correcto

app.get("/", async (req, res)=> {
    try {
        let query = "SELECT id, usuario, email, cel from usuarios";
        let respuesta = await qy(query, []);
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

// Levantar servidor en el puerto indicado

app.listen(port, ()=> {
console.log("Servidor escuchando en el puerto", port);
})