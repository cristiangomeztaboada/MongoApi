var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var usuarioSchema = Schema({
    codigo      : String,
    nombre      : String,
    rolCodigo   : String,
    clave       : String,
    foto        : String
});

module.exports = mongoose.model('Usuario', usuarioSchema);