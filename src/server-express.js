var express = require('express');
var fs = require('./endpoints/fs-express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

var app = express();
var dirname = process.cwd();
var port = process.env.PORT || 44710;

app.use(express.static(dirname + "/static", { dotfiles:'allow' }));
app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // for parsing application/x-www-form-urlencoded

fs.useAt(app, { root: dirname });

app.listen(port, function () {
    console.log('%s listening at %s', app.name, port);
});