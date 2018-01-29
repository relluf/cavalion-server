var restify = require('restify');
var fs = require('./endpoints/fs');


const server = restify.createServer({
    name: 'cavalion-server',
    version: '1.0.0',
    // accept: '*',
    // formatters: {
        'text/html': function(req, res, body) {
            // body is whatever was passed to res.send() - in the case of html, it usually is already an 
            // html string. In the case of errors, like your 404, you will get a NotFoundError here. you can
            // choose to implement a toString() on your error object, and this formatter function would
            // send back the html. you could alternatively check if body here is an error and do the 
            // appropriate thing as well. 
            console.log("BINGO!");
            return body.toString();
        },
        'text/less': function(req, res, body) {
            // body is whatever was passed to res.send() - in the case of html, it usually is already an 
            // html string. In the case of errors, like your 404, you will get a NotFoundError here. you can
            // choose to implement a toString() on your error object, and this formatter function would
            // send back the html. you could alternatively check if body here is an error and do the 
            // appropriate thing as well. 
            console.log("BINGO less!");
            return body.toString();
        },
        'text/*': function(req, res, body) {
            // body is whatever was passed to res.send() - in the case of html, it usually is already an 
            // html string. In the case of errors, like your 404, you will get a NotFoundError here. you can
            // choose to implement a toString() on your error object, and this formatter function would
            // send back the html. you could alternatively check if body here is an error and do the 
            // appropriate thing as well. 
            console.log("bingo!");
            return body.toString();
        }
    // }
});

server.acceptable.push('text/less');
console.log(server.acceptable);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

fs.useAt(server, {
	root: __dirname + "/../static"
});

server.get(/\/home\/?.*/, restify.plugins.serveStatic({
	directory: __dirname + "/../static",
	'default': "index.html"
}));

server.get(/\/shared\/?.*/, restify.plugins.serveStatic({
	directory: __dirname + "/../static"
}));

server.get(/\/code\/?.*/, restify.plugins.serveStatic({
	directory: __dirname + "/../static",
	'default': "index.html"
}));

server.listen(44710, function () {
    console.log('%s listening at %s', server.name, server.url);
});