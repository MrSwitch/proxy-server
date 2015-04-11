//
// OAuth Shim Tests
// Run from root with using command 'npm test'
//
// @author Andrew Dodson
// @since July 2013
//
//

////////////////////////////////
// Dependencies
////////////////////////////////



var proxy = require('../index'),
	querystring = require('querystring'),
	fs = require('fs'),
	connect = require("connect"),
	http = require("http"),
	path = require('path');


// Setup a test server
var request = require('supertest');
var app = http.createServer( proxy ).listen( 3000 );



////////////////////////////////
// Remote Server
////////////////////////////////

var connect = require('connect');
var remoteServer = connect(), srv, 
	remote_url = "http://localhost:3001/path";

beforeEach(function(){
	srv = remoteServer.listen(3001);
});

// tests here
afterEach(function(){
	srv.close();
});

remoteServer.use('/', function(req,res){

	var headers = req.headers;
	headers.method = req.method;
	headers.url = req.url;

	res.writeHead(200, headers);

	var buf='';
	req.on('data', function(data){
		buf+=data;
	});

	req.on('end', function(){
		////////////////////
		// TAILOR THE RESPONSE TO MATCH THE REQUEST
		////////////////////
		res.write(buf);
		res.end();
	});

});


// include this adds 'should' to all javascript objects...
// Indeed i too thought extending native objects was bad
// ... where there's a way there's a will!
require('should');

describe('Should handle GET requests with', function(){

	it("200", function(done){
		request(app)
			.get('/'+remote_url)
			.expect(200)
			.expect("url", "/path")
			.expect("method", "GET")
			.expect("Access-Control-Allow-Origin", "*")
			.expect("")
			.end(function(err, res){
				if (err) throw err;
				done();
			});
	});


	it("should use the address from a querystring e.g. /?url=address", function(done){
		request(app)
			.get('/url='+encodeURIComponent(remote_url))
			.expect(200)
			.expect("url", "/path")
			.expect("method", "GET")
			.expect("Access-Control-Allow-Origin", "*")
			.expect("")
			.end(function(err, res){
				if (err) throw err;
				done();
			});
	});

	it("should override the header from a querystring e.g. /?headers=key%3Dvalue%26key2%3Dvalue2", function(done){

		var path = '/?' + querystring.stringify({
				url : remote_url,
				headers : "key=value&key2=value2"
			});

		request(app)
			.get( path )
			.expect(200)
			.expect("url", "/path")
			.expect("method", "GET")
			.expect("key", "value")
			.expect("key2", "value2")
			.expect("Access-Control-Allow-Origin", "*")
			.expect("")
			.end(function(err, res){
				if (err) throw err;
				done();
			});
	});

});


describe('Should handle POST requests', function(){

	it("with regular post body", function(done){

		var body = "POST_DATA";

		request(app)
			.post('/'+remote_url)
			.send( body )
			.expect(200)
			.expect("url", "/path")
			.expect("method", "POST")
			.expect("Access-Control-Allow-Origin", "*")
			.expect( body )
			.end(function(err, res){
				if (err) throw err;
				done();
			});
	});

	xit("with a multipart POST body", function(done){

		request(app)
			.post('/'+remote_url)
			.attach("file", './test/tests.js')
			.expect(200)
			.expect("method", "POST")
			.expect("Access-Control-Allow-Origin", "*")
			.expect(/^\-\-.*?/)
			.end(function(err, res){
				if (err) throw err;
				done();
			});

	});

});