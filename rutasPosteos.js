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
        let respuesta = "";
        res.send(respuesta);
    }
    catch(e){
        res.status(413).send({message: e.message});
    }
});

module.exports = router;