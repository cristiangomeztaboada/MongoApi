var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DogSchema = Schema({
    name: String
	, color: String
});

module.exports = mongoose.model('Dog', DogSchema);