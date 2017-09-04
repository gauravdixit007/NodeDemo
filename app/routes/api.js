var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
	var token = jsonwebtoken.sign({
		_id : user._id,
		name : user.name,
		username : user.username
	}, secretKey, {
		expiresIn : '1h'
	});

	return token;
}
;

module.exports = function(app, express) {

	var api = express.Router();

	api.post('/users/signup', function(req, res) {

		var user = new User({
			name : req.body.name,
			username : req.body.username,
			password : req.body.password
		});

		user.save(function(err) {
			if (err) {
				response.send(err);
			}

			res.json({
				'success' : true,
				'message' : 'User has been created.'
			});
		});
	});

	api.get('/users', function(req, res) {

		User.find({}, function(err, users) {
			if (err) {
				response.send(err);
			}

			res.json({
				'success' : true,
				'data' : users
			});
		});
	});


	api.post('/users/login', function(req, res) {


		User.findOne({
			username : req.body.username
		}).select('password').exec(function(err, user) {
			if (err) return handleError(err);

			if (!user) {
				res.send({
					"error" : true,
					"message" : "User doesn't exist"
				});
			} else if (user) {
				var validPassword = user.comparePassword(req.body.password);

				if (!validPassword) {
					res.send({
						"error" : true,
						"message" : "Invalid Password"
					});
				} else {
					// Create a access token
					var token = createToken(user);

					res.json({
						success : true,
						message : "Login Successfull",
						token : token
					});
				}
			}
		});
	});


	// api.use defines a middleware. Defining it after login will make it applicable only for the apis defined after login
	// You can use app.use to create a global middleware.
	api.use(function(req, res, next) {
		console.log("Somebody just came to our app");

		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		//check if token exist
		if (token) {
			jsonwebtoken.verify(token, secretKey, function(err, decoded) {

				if (err) {
					res.send(err);
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.status(403).send({
				sucess : false,
				message : "No token provided"
			});
		}


	});
	
	
	// Any Apis defined after this point will need to provide an access token.
	// Chain methods allow us to call multiple methods on a single route. See the example below:
	api.route('/story')
		
		.post(function(req, res){
			var story = new Story({
				creator : req.decoded.id,
				content : req.body.content
			});
			
			story.save(function(err){
				if(err){
					res.send(err);
				}
				else{
					res.send({
						success: true,
						message: "New story is created."
					});
				}
			});
		})
		
		.get(function(req, res){
			
			var results = Story.find({
				creator: req.decoded.id
			}, function(err, stories){
				if(err){
					res.send(err);
				}
				else{
					res.send({
						success: true,
						data: stories
					});
				}
			});
		})
		
		
	api.get('/me', function(req, res){
		res.json(req.decoded);
	})	

	return api;

};