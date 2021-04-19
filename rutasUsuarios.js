const express = require('express');
const router = express.Router();
const model = require("./model.js");
const bcrypt = require("bcrypt")

router.get("/", async (req, res)=> {
    try {
        let respuesta = await model.traerUsuarios();
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

// registrar usuario
router.post("/", async (req, res)=>{
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

router.get("/:id", async function (req, res){
    try{
        let respuesta = await model.traerUnUsuario(req.params.id);
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({ "Error": e.message });
    }
})

router.get("/user/:usuario", async function (req, res){
    try{
        let respuesta = await model.buscarUnUsuarioPorUsername(req.params.usuario);
        delete respuesta[0].clave;
        res.send(respuesta[0]);
        }
    catch(e){
        res.status(413).send({ "Error": e.message });
    }
})

module.exports = router;