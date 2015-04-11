//
// Initiate the node server
//

// Abstracted away for tidying
var proxy = require('./index');
var http = require('http');
var https = require('https');
var port = process.env.PORT || 5002;

// Start app
console.log("Proxy server listening on port "+ port);
http.createServer( proxy ).listen( port );

// Define the credentials
proxy.intervene = function( options, next ){

	if( options.host === 'api.twitter.com' ){

		getTwitterBearerToken(function(token){
			// Update the options
			options.headers['Authorization'] = 'Bearer '+token;

			// Call next
			next();
		});

		return;
	}

	// Nothing to do
	next();
};


function getTwitterBearerToken(callback){

	request( {
		protocol : 'https:',
		hostname : 'api.twitter.com',
		headers : {
			'Authorization' : 'Basic '+ process.env.TWITTER,
			'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		path : '/oauth2/token',
		method : 'POST'
	}, 'grant_type=client_credentials', function(response){

		var json;
		try{
			json = JSON.parse(response);
		}catch(e){}

		callback(json.access_token);
	});
}




function request(options, body, callback ){

	var req = ( options.protocol === 'https:' ? https : http ).request(options, function(res){
		var data = '';
		res.on('data', function(chunk){
			data+=chunk;
		});
		res.on('end', function(){
			callback(data);
		});

	});
	req.on('error', function(){
		console.log('whoops');
	});

	if(body){
		req.write(body);
	}

	req.end();
}