//
// Proxy Server
// -------------
// Proxies requests with the Access-Control-Allow-Origin Header
//
// Usage GET http://proxy-server.herokuapp.com/[URL]
//
// e.g.  GET http://proxy-server.herokuapp.com/http://google.com
//
// @author Andrew Dodson
//

var url = require('url');

var port=process.env.PORT || 5002;

var http=require('http');
var https=require('https');

http.createServer(function(req,res){

	try{

		var resourceURL = req.url.replace(/^\//,'');
		if(!resourceURL || !resourceURL.match(/^https?:\/\/[a-z\.\-]+/i) ){
			throw Error("Damn no URL");
		}

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