const qy = require("./conexion.js");

module.exports = {
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
    
    traerPosteos: async function(){
        let respuesta = await qy("SELECT * from post", []);
        return respuesta;
    }   
}
