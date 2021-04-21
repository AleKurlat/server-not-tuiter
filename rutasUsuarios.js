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
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({message: e.message});
    }
});

// registrar usuario
router.post("/", async (req, res)=>{
    try{
        if(!req.body.usuario || !req.body.clave || !req.body.email ) {
            res.statusCode = 400;
            throw new Error ("No enviaste todos los datos necesarios");
        }

        //valido que el usuario no esté ya en la base de datos
        let respuesta = await model.buscarUsuariosPorEmail(req.body.email);        
        if (respuesta.length > 0) {
            res.statusCode = 400;
            throw new Error ("Ya existe un usuario con ese correo electrónico");
        }  
        respuesta = await model.buscarUsuariosPorUsername(req.body.usuario);     
        if (respuesta.length > 0) {
            res.statusCode = 400;
            throw new Error ("Ya existe un usuario con ese nombre");
        }
        
        // si esta todo bien, encripto la clave
        const claveEncriptada = await bcrypt.hash(req.body.clave, 10); // es asincronica asi que hay que agregarle siempre async al POST

        // Guardo el nuevo registro con la clave encriptada y le muestro al usuario los otros datos
        respuesta = await model.registrarUsuario(req.body.usuario, claveEncriptada, req.body.email);
        let regresarUsuarioRegistrado = await model.traerUnUsuario(respuesta); 
        res.json(regresarUsuarioRegistrado[0]);
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({message: e.message});
    }
});

router.get("/:id", async function (req, res){
    try{
        let respuesta = await model.traerUnUsuario(req.params.id);
        if(respuesta.length == 0) {
            res.statusCode = 404;
            throw new Error("No se encontró ningún usuario con ese ID");
        }
        res.send(respuesta[0]);
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({ "Error": e.message });
    }
})

router.get("/user/:usuario", async function (req, res){
    try{
        let respuesta = await model.buscarUnUsuarioPorUsername(req.params.usuario);
        if(respuesta.length == 0) {
            res.statusCode = 404;
            throw new Error("No se encontró ningún usuario con ese nombre");
        }
        delete respuesta[0].clave;
        res.send(respuesta[0]);
        }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({ "Error": e.message });
    }
})

module.exports = router;