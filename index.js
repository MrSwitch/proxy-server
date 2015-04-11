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
var http = require('http');
var querystring = require('querystring');
var https = require('https');
var merge = require('lodash/object/merge');

var access_controls_headers = {'Access-Control-Allow-Origin' : "*"};

var request = function(opts, callback){
	var req = (opts.protocol === 'https:'? https : http ).request(opts, callback);
	req.on('error', callback);
	return req;
};


module.exports = proxy;
module.exports.intervene = function(options,callback){callback();};

function proxy(req,res){


	// Maintain a collection of URL overriding parameters
	var params = {};


	// Is the entire path the request?
	// i.e. http://proxy-server/http://thirdparty.com/request/to/be/proxied
	var resourceURL = req.url.replace(/^\/+/,'');
	if( resourceURL && !resourceURL.match(/^[a-z]+:\/\/[a-z\.\-]+/i) ){

		// Otherwise update the default parameters
		params = querystring.parse(resourceURL.replace(/.*\?/,''));

		// Redefine the URL
		resourceURL = params.url;
		delete params.url;
	}

	if( !resourceURL || !resourceURL.match(/^[a-z]+:\/\/[a-z\.\-]+/i) ){
		error(res);
		return;
	}

	// Options
	var proxyOptions = url.parse(resourceURL);
	proxyOptions.headers = {};
	merge( proxyOptions.headers, req.headers, querystring.parse( params.headers ) );
	proxyOptions.method = params.method || req.method;
	proxyOptions.agent = false;

	// remove unwanted headers in the request
	delete proxyOptions.headers.host;

	// Augment the request
	// Lets go and see if the value in here matches something which is stored locally
	module.exports.intervene( proxyOptions, proxyRequest( req ).bind( null, proxyOptions, res ) );
}


function proxyRequest( req ){

	// Buffer the request
	// TODO

	// Return a function once the authorization has been granted
	return function( options, res){

		var connector = request(options, proxyResponse.bind(null,res));
		req.pipe(connector, {end:true});
	}
}


function proxyResponse(clientResponse,serverResponse){
	var headers = {};
	if( serverResponse instanceof Error ){
		return error(clientResponse);
	}
	merge( headers, serverResponse.headers, access_controls_headers );
	clientResponse.writeHeader(serverResponse.statusCode, headers);
	serverResponse.pipe(clientResponse, {end:true});
}

function error(res){
	res.writeHead(400,access_controls_headers);
	res.end();
}