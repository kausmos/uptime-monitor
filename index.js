/*
*Primary file for the api
*/


//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
let StringDecoder= require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

const unifiedServerCallback = function(req,res){
    //TODO: convert from legacy code
    var parsedURL= url.parse(req.url, true);
    
    //get the pathname( i.e. path without query string)
    const path = parsedURL.pathname;
    //remove any trailing /
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the type of method
    const method=req.method.toLowerCase();

    //get the query  string
    const queryStringObject=parsedURL.query;

    //get the headers as an object
    const headers=req.headers;

    //get the payload if any
    //we'll need the string decoder library
    let decoder = new StringDecoder('utf8');
    let buffer='';
    req.on('data', function(data){ buffer+=(decoder.write(data))} );
    req.on('end', ()=>{
        buffer+=(decoder.end());
        const  data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
          };

        const chosenHandler = trimmedPath in router? router[trimmedPath] : handlers.notFound;
        chosenHandler(data,function(status,payload){
            status = typeof status === 'number' ? status : 200;
            payload = typeof payload === 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type','application/json');
            res.writeHead(status);
            
            res.end(payloadString);
        });      
    
    }); 
    
    let handlers={};
    handlers.ping=function(data, callback){
        callback(200,{});
    }
    handlers.notFound=function(data,callback){
        callback(404);
    }

    let router={"ping":handlers.ping};


    console.log("Request received on path:"+trimmedPath+" with method "+method);
    console.log("Having query string:",queryStringObject);
    console.log("Headers ",headers);    

    
    
}

//Server should respond to all requests with a string

//Instantiation HTTP server
const HTTPServer = http.createServer(unifiedServerCallback);

//Instantiate HTTPS server
const sslOptions ={};
sslOptions.cert=fs.readFileSync('./https/cert.pem');
sslOptions.key=fs.readFileSync('./https/key.pem');
const HTTPSServer = https.createServer(sslOptions,unifiedServerCallback);

//start http server, ask it to listen to port designated for environment for http
HTTPServer.listen(config.httpPort,function(){
    console.log("listening on port "+config.httpPort+" now on environment "+config.envName);
});

//start https server, ask it to listen to port designated for environment for http
HTTPSServer.listen(config.httpsPort,function(){
    console.log("listening on port "+config.httpsPort+" now on environment "+config.envName);
});