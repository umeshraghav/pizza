 
/*
Pizza API
*/

const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
const _data = require('./data');

 




const server = http.createServer(function(req,res){

        //get the parsedUrl 
        const parsedUrl = url.parse(req.url,true);
        const path = parsedUrl.pathname;
        //trim the path
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');
        //get the request method 
        const method = req.method.toLocaleLowerCase();
        //get the queryString in Object
        const querStringObject = parsedUrl.query;
        const headers = req.headers;
        
         const decoder = new stringDecoder('utf-8');
        var buffer = "";

        req.on('data', function(data){
            buffer += decoder.write(data);
        });

        req.on('end',function(){
            buffer += decoder.end();

    const choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

            const data = {
                "trimmedPath" : trimmedPath,
                "method" : method,
                "headers" : headers,
                "payload" : helpers.parseToObject(buffer),
                "querStringObject" : querStringObject
            }

        choosenHandler(data, function(statusCode,payload){
                console.log(statusCode,payload);

                const payloadString = JSON.stringify(payload)
				 res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
               // console.log(buffer);
                res.end(payloadString);

        });






           
        })




});



//listen to the server 

server.listen(3000,function(){
    console.log("Server is listening on 3000");
})


const router = {

    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'menu' : handlers.menu,
    'cart' : handlers.cart
};
