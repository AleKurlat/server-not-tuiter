const qy = require("./conexion.js");

module.exports = {

    //Empiezan las queries de usuarios 
    
    buscarUsuariosPorEmail: async function(email) {
        let respuesta = await qy("SELECT * FROM usuarios WHERE email = ?", [email]);
        return respuesta;
    },

    buscarUsuariosPorUsername: async function(usuario){
        let respuesta = await qy("SELECT * FROM usuarios WHERE usuario = ?", [usuario]);
        return respuesta; 
    },

    registrarUsuario: async function(usuario, clave, email, cel) {
        let respuesta = await qy("INSERT INTO usuarios (usuario, clave, email, cel) VALUE (?, ?, ?, ?)", [usuario, clave, email, cel]);
        return respuesta.insertId;
    },

    traerUnUsuario: async function(id){
        let respuesta = await qy("SELECT id, usuario, email, cel from usuarios WHERE id = ?", [id]);
        return respuesta[0];
    },

    buscarUnUsuarioPorUsername: async function(usuario){
        let respuesta = await qy("SELECT * from usuarios WHERE usuario= ?", [usuario]);
        return respuesta;
    },
    
    traerUsuarios: async function(){
        let respuesta = await qy("SELECT id, usuario, cel, email from usuarios", []);
        return respuesta;
    },
    
    // Empiezan las queries de posteos

    traerPosteos: async function(){
        let respuesta = await qy("SELECT * from post WHERE archivado is NULL", []);
        return respuesta;
    },

    traerUnPosteo: async function(id){
        let respuesta = await qy("SELECT * from post WHERE id = ? AND archivado is NULL", [id]);
        return respuesta[0];
    },
    
    agregarPosteo: async function(body, id_user){
        let respuesta = await qy("INSERT INTO post (body, id_user) VALUE (?, ?)", [body, id_user]);
        return respuesta.insertId;
    },

    borrarPosteo: async function(id){
        let respuesta = await qy("UPDATE post SET archivado = ? WHERE id = ?", [1, id]);
        return respuesta.affectedRows;
    },

    editarPosteo: async function(body, id){
        let respuesta = await qy("UPDATE post SET body = ? WHERE id = ? AND archivado is NULL", [body, id]);
        return respuesta.affectedRows;
    },
}
