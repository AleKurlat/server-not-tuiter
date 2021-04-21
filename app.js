//APP LOGIN
const express = require("express");
const jwt = require("jsonwebtoken");
const unless = require("express-unless");
const bcrypt = require("bcrypt");
const cors = require('cors');
const model = require("./model.js");
const app = express();
const port = process.env.PORT ? process.env.PORT : 3001;
const rutasPosteos = require('./rutasPosteos.js');
const rutasUsuarios= require('./rutasUsuarios.js');

app.use(cors());
app.use(express.json());


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

        const base64Url = token.split('.')[1];
        const base64Decode = Buffer.from(base64Url, "base64");
        res.locals.datosToken = JSON.parse(base64Decode);

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
        {url : "/api/login", methods: ["POST"]}, //es un array porque podria usar varios metodos separadas por comas
        {url : "/api/usuarios", methods: ["POST"]},
    ]
})); 

app.use("/api/posteos", rutasPosteos);
app.use("/api/usuarios", rutasUsuarios);
// Loguearse

app.post("/api/login", async (req, res)=> {
    try {
        if(!req.body.usuario || !req.body.clave) {
            res.statusCode = 400;
            throw new Error ("No enviaste todos los datos necesarios");
        }

        //paso 1: busco el usuario en base de datos
        let respuesta = await model.buscarUnUsuarioPorUsername(req.body.usuario)
        if(respuesta.length == 0){
            res.statusCode = 404;
            throw new Error("Ha ingresado un usuario que no existe");
        } 

        // Paso 2: verificar que clave ingresada coincida con la encriptada en base de datos

        const recuperarClaveEncriptada = respuesta[0].clave;
        if(!bcrypt.compareSync(req.body.clave, recuperarClaveEncriptada)){
            res.statusCode = 400;
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
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({message: e.message});
    }
});

// Levantar servidor en el puerto indicado

app.listen(port, ()=> {
console.log("Servidor escuchando en el puerto", port);
})