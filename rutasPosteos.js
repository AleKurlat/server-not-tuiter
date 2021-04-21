const express = require('express');
const router = express.Router();
const model = require("./model.js");

function recuperarDataToken(req){   
    const token = req.headers["authorization"];
    if(!token){
        throw new Error ("No envió token");
    }
    const base64Url = token.split('.')[1];
    const base64Decode = Buffer.from(base64Url, "base64");
    return JSON.parse(base64Decode);
}

router.get("/", async (req, res)=> {
    try {
        let respuesta = await model.traerPosteos();
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

router.post("/", async (req, res)=> {
    try {
        let respuesta = await model.agregarPosteo(req.body.body, req.body.id_user);
        let regresarPosteo = await model.traerUnPosteo(respuesta);
        res.send(regresarPosteo);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

router.get("/:id", async function (req, res){
    try{
        let respuesta = await model.traerUnPosteo(req.params.id);
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({ "Error": e.message });
    }
})

//borrar post

router.delete("/:id", async function (req, res){
    try{
        const dataToken = recuperarDataToken(req);
        const posteoABorrar = await model.traerUnPosteo(req.params.id);
        
        if(dataToken.user_id != posteoABorrar.id_user) {
            throw new Error ("Un post solo puede ser borrado por su autor");
        }
        let respuesta = await model.borrarPosteo(req.params.id);
        if (respuesta == 0) {
            throw new Error ("No se borró ningún post");
        } else res.send("Post eliminado correctamente");
    }
    catch(e){
        res.send({ "Error": e.message });
    }
})

module.exports = router;