//APP LOGIN
const express = require("express");
const jwt = require("jsonwebtoken");
const unless = require("express-unless");
const bcrypt = require("bcrypt");
const cors = require('cors');
const model = require("./model.js");
const app = express();
const port = process.env.PORT ? process.env.PORT : 3001;

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
        let respuesta = await model.buscarUsuariosPorEmail(req.body.email);        
        if (respuesta.length > 0) {
            throw new Error ("Ya existe un usuario con ese correo electrónico");
        }  
        respuesta = await model.buscarUsuariosPorUsername(req.body.usuario);     
        if (respuesta.length > 0) {
            throw new Error ("Ya existe un usuario con ese nombre");
        }
        
        // si esta todo bien, encripto la clave
        const claveEncriptada = await bcrypt.hash(req.body.clave, 10); // es asincronica asi que hay que agregarle siempre async al POST

        // Guardo el nuevo registro con la clave encriptada y le muestro al usuario los otros datos
        respuesta = await model.registrarUsuario(req.body.usuario, claveEncriptada, req.body.email, req.body.cel);
        let regresarUsuarioRegistrado = await model.traerUnUsuario(respuesta); 
        res.json(regresarUsuarioRegistrado);
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
        let respuesta = await model.buscarUnUsuarioPorUsername(req.body.usuario)
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

// Las siguientes rutas dan respuesta solo si en la petición se envía Authorization como Key y el token como Header

app.get("/api/posteos", async (req, res)=> {
    try {
        let respuesta = await model.traerPosteos();
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

app.post("/api/posteos", async (req, res)=> {
    try {
        let respuesta = "";
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

app.get("/api/usuarios", async (req, res)=> {
    try {
        let respuesta = await model.traerUsuarios();
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