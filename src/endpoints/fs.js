'use strict';

var restify = require('restify');
var fs = require('fs');
var filesystem = require('file-system');
var rimraf = require('rimraf');
var mime = require('mime');
var mixin = require('mixin-object');
var md5 = require('md5');
var rr = require('recursive-readdir');

function salt(message) {
	var pre = "c4v4710n";
	var post = "44700";
	return md5(pre + message + post);
}
function handleError(res, err, next) {
	console.error(err);
	if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
		res.send(404);
	} else {
		res.send(500, { reason: err.message });
	}
}

exports.useAt = function (server, opts) {
	
	opts = opts || {};

	var base = opts.base || "fs";
	var re = new RegExp("\\/" + base + "\\/?.*");

	// server.get("/" + base + "?index", function(req, res, next) {
    server.get(re, function(req, res, next) {
		
		function index(req, res, next) {		
			
			if(typeof req.query.uris !== "string") {
				res.send(406, "No uris");
				return next();
			}
			
			var uris = req.query.uris.split(";");
			var result = {}, count = uris.length;
			uris.forEach(function(uri) {
				var fspath = opts.root + uri;
				
				console.log(">>>" + fspath + "...");
				fs.lstat(fspath, function(err, stats) {
					if(err) {
						console.log(fspath, err);
						result[fspath] = err.message;
					} else if(!stats.isDirectory()) {
						result[fspath] = [];
					} else {
						rr(fspath, function(err, files) {
							//if(err) return handleError(res, err);
							if(err) console.log(err);
							
							result[fspath] = err ? err.message : files;
						});
					}
					if(--count === 0) {
						res.send(200, result);
					}
				});
			});
		
			next();
		}

    	if(req.query.hasOwnProperty("index")) {
    		return index(req, res, next);
    	}
    	
        var recursive = req.params.recursive; // create an index 
        var file = req.params.file; // suggest name for downloading the file
        var encoding = req.params.encoding || 'utf-8';
        var position = req.params.position;
        var size = req.params.size; 
    	
		var uri = req.path().substring(base);
		var fspath = opts.root + uri;
		var list = uri.charAt(uri.length - 1) === '/'; // user expects list

		fs.lstat(fspath, function(err, stats) {
			if(err) return handleError(res, err);
			
			if(list || stats.isDirectory()) {
				fs.readdir(fspath, {}, function(err, files) {
					if(err) return handleError(res, err);
					
					var result = {};
					files.forEach((name) => {
		 				try {				
		 					var stats = fs.lstatSync(fspath + "/" + name);
		 					result[name] =  mixin({
		 						size: stats.size,
		 						atime: stats.atime,
		 						btime: stats.birthtime,
		 						ctime: stats.ctime,
		 						link: stats.isSymbolicLink() ? true : false,
		 						// mime: mime.getType(name.split(".").pop()),
		 						mtime: stats.mtime,
		 						rev: salt(stats.mtime),
		 						type: stats.isSymbolicLink() || stats.isDirectory() ? "Folder" : "File"
		 					});
						} catch(e) {
							result[name] = e.message;
						}
					});
					
					res.send(200, result);
				});
			} else {
				fs.readFile(fspath, { encoding: encoding }, function(err, data) {
					// if(err) return res.send(403, { reason: err.message });
					if(err) return handleError(res, err);
					
					res.send(200, {
						text: data,
						revision: salt(stats.mtime),
						position: 0,
						size: data.length
					});
				});
			}
		});
		
    	next();
    });
    server.put(re, function(req, res, next) {
		var uri = req.path().substring(base);
		var fspath = opts.root + uri;
		if(typeof req.body !== "object") {
			res.send(500, { reason: "Invalid request" });
		}
		
		fs.lstat(fspath, function(err, stats) {
			if(err) return handleError(res, err);
			
			var revision = salt(stats.mtime);
			if(revision !== req.body.revision) {
				
				console.log('$revision !== $req.body.revision', revision, req.body.revision);
				
				res.send(409, { message: "Out of date, update working code" });
				return;
			}
			
			fs.writeFile(fspath, req.body.text, function(err) {
				if(err) return handleError(res, err);
				
				fs.lstat(fspath, function(err, stats) {
					if(err) return handleError(res, err);
					
					res.send(200, { size: stats.size, revision: salt(stats.mtime) });
				});
			});
		});
		
		next();
    });
    server.post(re, function(req, res, next) {
		var uri = req.path().substring(base);
		var fspath = opts.root + uri;
		if(typeof req.body !== "object") {
			res.send(500, { reason: "Invalid request" });
		}
		
		fs.lstat(fspath, function(err, stats) {
			if(!err) return res.send(406, "Already exists");

			fs.writeFile(fspath, req.body.text, function(err) {
				if(err) return handleError(res, err);
				
				fs.lstat(fspath, function(err, stats) {
					if(err) return handleError(res, err);
					
					res.send(200, { size: stats.size, revision: salt(stats.mtime) });
				});
			});
		});

		next();
    });
    server.del(re, function(req, res, next) {
		var uri = req.path().substring(base);
		var fspath = opts.root + uri;

		fs.lstat(fspath, function(err, stats) {
			if(err) return handleError(res, err);
			
			if(stats.isDirectory()) {
				rimraf(fspath, function(err) {
					if(err) return handleError(res, err);

					res.send(204);
				});
			} else {
				fs.unlink(fspath, function(err) {
					if(err) return handleError(res, err);
					
					res.send(204);
				});
			}
		});
		
		next();
    });
};


