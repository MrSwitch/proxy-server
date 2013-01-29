//
// Proxy Server passes all traffic with the Allow-Origin-Control-Header
// @author Andrew Dodson
//
var fs = require('fs');
var path = require('path');
var url = require('url');

var port=process.env.PORT || 5002;
var http=require('http');
var https=require('https');

http.createServer(function(req,res){


	try{

		var resourceURL = req.url.replace(/^\//,'');

		// make a call to the resource
		var request = resourceURL.match(/^https/) ? https : http;

		request.get( url.parse(resourceURL), function(r){

			var headers = r.headers;
			headers['Access-Control-Allow-Origin'] = "*";
			res.writeHead(r.statusCode, headers);

			r.on('data', function(chunk){
				res.write(chunk);
			});

			r.on('end', function(){
				res.end();
			});

		});

	}
	catch(e){

		res.writeHead(502);
		res.end();

	}

}).listen(port);