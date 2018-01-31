var express = require('express');
var fs = require('./endpoints/fs-express');

var server = express();
var dirname = process.cwd();

fs.useAt(server, { root: dirname });

server.use(express.static(dirname + "/static", {}));

server.listen(44710, function () {
    console.log('%s listening at %s', server.name, server);
});
