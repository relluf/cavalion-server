var restify = require('restify');
var fs = require('./endpoints/fs');
var mime = require("mime");


const server = restify.createServer({
    name: 'cavalion-server',
    version: '1.0.0'
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
	directory: __dirname + "/../static",
	'default': "index.html"
}));

server.get(/\/code\/?.*/, restify.plugins.serveStatic({
	directory: __dirname + "/../static",
	'default': "index.html"
}));

server.listen(44710, function () {
    console.log('%s listening at %s', server.name, server.url);
});
