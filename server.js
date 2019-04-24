var Dog = require('./dog');
var Usuario = require('./modelos/usuario');
var mongoose = require('mongoose'); // Utilizamos la librería de mongoose
var jwt = require('jsonwebtoken');
var palabraSecreta = "cdgt1986";

var express    = require('express');        // Utilizaremos express, aqui lo mandamos llamar

var app        = express();                 // definimos la app usando express
var bodyParser = require('body-parser'); //

// configuramos la app para que use bodyParser(), esto nos dejara usar la informacion de los POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // seteamos el puerto

var router = express.Router();   //Creamos el router de express

app.use(bodyParser.json());

var cors = require('cors');

app.use(cors());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    next();
});

app.use(function (req, res, next) {
	
	if(!(req.originalUrl === '/api/login'))
	{
		//console.log(req.headers['jwt']);
		var token = req.headers['jwt']
		if(!token){
			res.status(401).send({
			  error: "Es necesario el token de autenticación"
			})
			return
		}
		
		jwt.verify(token, palabraSecreta, function(err, user) {
		  if (err) {
			res.status(401).send({
			  error: 'Token inválido'
			})
		  }
		})
	}
	
	//res.end();
	next();
});

router.post('/login', function(req, res) {
	var username = req.body.usuario
	var password = req.body.clave
	var autenticado = false;
	
	var obj = Usuario;
	
	obj.findOne({codigo:username},function (err, usuario) 
	{
		if (err)
		{
			return console.log(err);			
		}		
		
		if (usuario==null)
		{
			res.status(401).send({error:'usuario o clave inválida'});
		}
		else
		{
			if (usuario.codigo == username && usuario.clave == password)
			{
				var tokenData = {
					username: username
					// ANY DATA
				}
				
				var token = jwt.sign(tokenData, palabraSecreta, {
				 expiresIn: 60 * 60 * 24 // expires in 24 hours
				})

				res.status(200).send({token:token});
			}
			else
			{
				res.status(401).send({error:'usuario o clave inválida'});
			}
			/*
			console.log(usuario)
			autenticado=true
			console.log(autenticado)
			//res.json(obj);
			var tokenData = {
				username: username
				// ANY DATA
			}

			var token = jwt.sign(tokenData, palabraSecreta, {
			 expiresIn: 60 * 60 * 24 // expires in 24 hours
			})

			res.send({token:token});
			*/
		}		
	}); 
});

// Seteamos la ruta principal
router.get('/', function(req, res) {
    res.json({ message: 'Hooolaa :)'});
});

//INICIO USUARIOS*****************************************************************************************
router.route('/usuarios/:codigo').delete(function(req, res) 
{
    var obj = Usuario;
    
	obj.deleteOne({ codigo: req.params.codigo }, function (err) 
	{
		console.log('Usuario borrado');
		
	});
	res.end();
});

router.route('/usuarios').post(function(req, res) 
{
    var obj = new Usuario(req.body);
    
	obj.save(function (err, obj) 
	{
		if (err) 
		{
			return console.error(err);
		}
		else
		{
			console.log('Usuario creado');			
		}
	});
	res.end();
});
router.route('/usuarios').get(function(req, res) 
{
	var obj = Usuario;
	
	obj.find(function (err, objs) 
	{
		if (err)
		{
		  return console.error(err);
		}

		res.json(objs);
	});  		
});
router.route('/usuarios/:codigo').put(function(req, res) 
{
    var obj = Usuario;
    
	obj.updateOne({codigo:req.params.codigo},req.body, function (err) {
		console.log('Usuario modificado');		
	});
	res.end();
});

router.route('/usuarios/:codigo').get(function(req, res) 
{
	var obj = Usuario;
	
	obj.find({codigo:req.params.codigo},function (err, obj) 
	{
		if (err)
		{
		  return console.error(err);
		}
	  
		res.json(obj);
	});  		
});
//FIN USUARIOS*************************************************************************************

router.route('/dogs').get(function(req, res) 
{
		var dog = Dog;
		
		dog.find(function (err, dogs) {
		  if (err)
		  {
			  return console.error(err);
		  }
		  
		  res.json(dogs);
		});  
		
});

router.route('/dogs/:name').get(function(req, res) 
{
		var dog = Dog;
		
		dog.find({name:req.params.name},function (err, dog) {
		  if (err)
		  {
			  return console.error(err);
		  }
		  
		  res.json(dog);
		});  
		
});



router.route('/dogs/:name').delete(function(req, res) {
    var dog = Dog // Creamos una nueva instancia del model Dog
    
	dog.deleteOne({ name: req.params.name }, function (err) {
		console.log('Dog borrado');
		
	});
	res.end();
});

router.route('/dogs/:name') //agregamos la ruta /dogs
  .put(function(req, res) {
    var dog = Dog // Creamos una nueva instancia del model Dog
    
	dog.updateOne({name:req.params.name},req.body, function (err) {
		console.log('Dog modificado');
		
	});
	res.end();
});

// Le decimos a la aplicación que utilize las rutas que agregamos
app.use('/api', router);

// Iniciamos el servidor
app.listen(port);
console.log('Aplicación creada en el puerto: ' + port);

//Creamos la conexión con mongo
mongoose.connect('mongodb://localhost:27017/myDb', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('estamos conectados!'); 
});