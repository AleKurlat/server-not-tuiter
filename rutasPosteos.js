const express = require('express');
const router = express.Router();
const model = require("./model.js");

router.get("/", async (req, res)=> {
    try {
        let respuesta = await model.traerPosteos();
        res.send(respuesta);
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({"Error": e.message});
    }
});

router.post("/", async (req, res)=> {
    try {
        if(!req.body.body){
            res.statusCode = 400;
            throw new Error("Es necesario que el posteo no esté vacío");
        }
        const fechaPosteo = new Date();
        let respuesta = await model.agregarPosteo(req.body.body, res.locals.datosToken.user_id, fechaPosteo);
        let regresarPosteo = await model.traerUnPosteo(respuesta);
        res.send(regresarPosteo[0]);
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({"Error": e.message});
    }
});

router.get("/:id", async function (req, res){
    try{
        let respuesta = await model.traerUnPosteo(req.params.id);
        if(respuesta.length == 0) {
            res.statusCode = 404;
            throw new Error("No se encontró ningún posteo con ese ID o bien está archivado");
        }
        res.send(respuesta[0]);
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({ "Error": e.message });
    }
})

//borrar post

router.delete("/:id", async function (req, res){
    try{
        const posteoABorrar = await model.traerUnPosteo(req.params.id);
        if(posteoABorrar.length == 0) {
            res.statusCode = 404;
            throw new Error("No se encontró ningún posteo con ese ID o bien está archivado");
        }
        
        if(res.locals.datosToken.user_id != posteoABorrar[0].id_user) {
            res.statusCode = 403;
            throw new Error ("Un post solo puede ser borrado por su autor");
        }
        let respuesta = await model.borrarPosteo(req.params.id);

        if (respuesta == 0) {
            res.statusCode = 400;
            throw new Error ("No se borró ningún post");
        } else {
            res.send("Post eliminado correctamente")
        };
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({ "Error": e.message });
    }
})

router.put("/:id", async function (req, res){
    try{
        const posteoAEditar = await model.traerUnPosteo(req.params.id);
        if(posteoAEditar.length == 0) {
            res.statusCode = 404;
            throw new Error("No se encontró ningún posteo con ese ID o bien está archivado");
        }
        
        if(res.locals.datosToken.user_id != posteoAEditar[0].id_user) {
            res.statusCode = 403;
            throw new Error ("Un post solo puede ser editado por su autor");
        }

        if(!req.body.body){
            res.statusCode = 400;
            throw new Error("Es necesario que el posteo no esté vacío");
        }

        const fechaEdicion = new Date();
        let respuesta = await model.editarPosteo(req.body.body, fechaEdicion, req.params.id);

        if (respuesta == 0) {
            res.statusCode = 400;
            throw new Error ("No se realizó ninguna modificación");
        } else {
            res.send("Post editado correctamente")
        };
    }
    catch(e){
        if(res.statusCode === 200){res.statusCode = 500};
        res.send({ "Error": e.message });
    }
})

module.exports = router;