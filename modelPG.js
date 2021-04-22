const conexion = require("./conexionPG.js");
const client = conexion.conectar();

module.exports = {

    //Empiezan las queries de usuarios 
    
    buscarUsuariosPorEmail: async function(email) {
        let respuesta = await client.query(
            "SELECT * FROM usuarios WHERE email = $1", 
            [email]);
        return respuesta.rows;
    },

    buscarUsuariosPorUsername: async function(usuario){
        let respuesta = await client.query(
            "SELECT * FROM usuarios WHERE usuario = $1", 
            [usuario]);
        return respuesta.rows; 
    },

    registrarUsuario: async function(usuario, clave, email) {
        let respuesta = await client.query(
            "INSERT INTO usuarios (usuario, clave, email) VALUES ($1, $2, $3)", 
            [usuario, clave, email]);
        return respuesta.rows;
    },

    traerUnUsuario: async function(id){
        let respuesta = await client.query(
            "SELECT id, usuario, email from usuarios WHERE id = $1", 
            [id]);
        return respuesta.rows;
    },

    buscarUnUsuarioPorUsername: async function(usuario){
        let respuesta = await client.query(
            "SELECT * from usuarios WHERE usuario= $1", 
            [usuario]);
        return respuesta.rows;
    },
    
    traerUsuarios: async function(){
        let respuesta = await client.query(
            "SELECT id, usuario, email from usuarios", 
            []);
        return respuesta.rows;
    },
    
    // Empiezan las queries de posteos

    traerPosteos: async function(){
        let respuesta = await client.query(
            "SELECT post.*, usuarios.usuario from post JOIN usuarios ON usuarios.id = post.id_user WHERE archivado is NULL", 
            []);
        return respuesta.rows;
    },

    traerUnPosteo: async function(id){
        let respuesta = await client.query(
            "SELECT post.*, usuarios.usuario from post JOIN usuarios ON usuarios.id = post.id_user WHERE post.id = $1 AND archivado is NULL", 
            [id]);
        return respuesta.rows;
    },
    
    agregarPosteo: async function(body, id_user, fecha){
        let respuesta = await client.query(
            "INSERT INTO post (body, id_user, fecha) VALUES ($1, $2, $3)", 
            [body, id_user, fecha]);
        return respuesta.rows;
    },

    borrarPosteo: async function(id){
        let respuesta = await client.query(
            "UPDATE post SET archivado = $1 WHERE id = $2", 
            [1, id]);
        return respuesta.rowCount;
    },

    editarPosteo: async function(body, editado, id){
        let respuesta = await client.query(
            "UPDATE post SET body = $1, editado = $2 WHERE id = $3 AND archivado is NULL", 
            [body, editado, id]);
        return respuesta.rowCount;
    },
}
