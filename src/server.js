var restify = require('restify');
var fs = require('./endpoints/fs');

const server = restify.createServer({
    name: 'cavalion-server',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

fs.useAt(server, {
	root: __dirname + "/.."
});

server.get('/echo/:name', function (req, res, next) {
    res.send(req.params);
    return next();
});

server.listen(44710, function () {
    console.log('%s listening at %s', server.name, server.url);
});