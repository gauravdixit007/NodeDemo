
//This is a lightweight framework which let us create amazing apis
var express = require('express');
var bodyParser = require('body-parser');

// This is required to log all the requests on the terminal which are coming in on the node server..
var morgan = require('morgan');
var config = require('./config')

// This package is required to connect to the mongodb database
var mongoose = require('mongoose');

mongoose.connect(config.database, function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("Connected to the database...");
	}
});

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var api = require('./app/routes/api')(app, express);
app.use('/api', api); 


app.get('*', function(req, res){
	res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function(err){
	if(err){
		console.log("Error occured");
 	}
	else{
		console.log("Listening on port 3000...")
	}
});

