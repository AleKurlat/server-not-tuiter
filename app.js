//APP not-tuiter

const express = require("express");
const jwt = require("jsonwebtoken");
const unless = require("express-unless");
const bcrypt = require("bcrypt");
const cors = require('cors');
const model = require("./modelPG.js");
const app = express();
const port = process.env.PORT ? process.env.PORT : 3001;
const rutasPosteos = require('./rutasPosteos.js');
const rutasUsuarios= require('./rutasUsuarios.js');

// llamo al CORS antes que a cualquier otra cosa, para bloquear todo lo que no venga del cliente autorizado

var whitelist = ['https://not-tuiter.herokuapp.com'];
if(!process.env.PORT){
    whitelist = ["http://localhost:3000"];
}

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));

// permito recibir JSONs de cliente (tiene que ir antes que cualquier middelware o ruta que reciba sus parámetros por JSON)

app.use(express.json());

// Si quisiera llamar a algún middleware para contar requests para evitar ataques DDOS, debería ir aca abajo y antes de la autenticación

// defino y llamo al middleware de autenticación, que se interpone antes de hacer cualquier cosa, con las expcepciones definidas en el unless. Toda ruta que deba ser autenticada debe llamarse DESPUÉS de esto.

const auth = (req, res, next) => {
    try{
        let token = req.headers["authorization"];
        if(!token){
            throw new Error("no estas logueado");
        }

        token = token.replace("Bearer ", "");

        jwt.verify(token, "Secret", (err, user) => {
            if (err) {
                throw new Error("Token invalido. Probar cerrando sesión y volviendo a loguearse");
            }
        });

        const base64Url = token.split('.')[1];
        const base64Decode = Buffer.from(base64Url, "base64");
        res.locals.datosToken = JSON.parse(base64Decode);

        next();
    }

    catch(e) {
        res.status(403).send({"Error": e.message});
    }

}

// a la función "auth" declarada más arriba le creo un método de excepción

auth.unless = unless;  

// llamo a la función con su excepción 

app.use(auth.unless({
    path: [
        {url : "/api/login", methods: ["POST"]}, //es un array porque podria usar varios metodos separadas por comas
        {url : "/api/usuarios", methods: ["POST"]},
        {url : "/", methods: ["GET"]},
    ]
}));

// llamo a las rutas de posteos y usuarios. Cualqier middleware que quiera usar universalmente tiene que ir ANTES que esto

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
        res.send({"Error": e.message});
    }
});

app.get("/", (req, res) => {
    res.send("Bienvenidx");
})

// Levantar servidor en el puerto indicado

app.listen(port, ()=> {
console.log("Servidor escuchando en el puerto", port);
})