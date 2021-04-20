const express = require('express');
const router = express.Router();
const model = require("./model.js");

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

module.exports = router;