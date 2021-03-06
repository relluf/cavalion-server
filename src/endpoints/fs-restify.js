'use strict';

var restify = require('restify');
var fs = require('fs');
var filesystem = require('file-system');
var rimraf = require('rimraf');
var mime = require('mime');
var mixin = require('mixin-object');
var md5 = require('md5');
var rr = require('recursive-readdir');
var path = require('path');
var querystring = require("querystring");

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

    server.get(re, function(req, res, next) {
		
		function index(req, res, next) {		
			
			if(!req.query.uris) {
				res.send(406, "No uris");
				return next();
			}
			
			var uris = req.query.uris.split(";");
			var result = {}, count = uris.length;
			uris.forEach(function(uri) {
				
				function dec() { if(--count === 0) { res.send(200, result); } }

				var root = opts.root + "/" + base;	
				var fspath = root + "/" + uri;
				
				fs.lstat(fspath, function(err, stats) {
					if(err) {
						// result[uri] = [{type: err.message, name: "."}];
						dec();
					} else if(stats.isSymbolicLink()) {
						// result[uri] = [{type: "symbolic-link", name: "."}];
						dec();
					} else if(!stats.isDirectory()) {
						// result[uri] = [{type: "no-directory", name: "."}];
						dec();
					} else {
						var all_stats = {}, size = 0;
						function ignore(file, stats) {
							// Track all files, so details can be reported later
							all_stats[file] = stats;
							return (++size > 50 * 100) || stats.isSymbolicLink() || ["bower_components", "node_modules", 
									".svn", ".git", ".metadata", ".sencha", ".hoodie", ".DS_Store"].indexOf(path.basename(file)) !== -1;
						}

						/*- ignore helps to track all stats objects */
						rr(fspath, [ignore], function(err, files) {
							result[uri] = err ? err.message : 
								files.map(_ => ({
									type: all_stats[_].isDirectory() ? "Folder" : "File",
									path: _.substring(root.length + uri.length + 2)
									// name: _.substring(root.length + uri.length + 2).split("/").pop(),
									// key: _.substring(root.length + uri.length + 2).split("/").pop(),
									// name: _.substring(root.length + uri.length + 2)
								}));
							dec();
						});
					}

				});
			});
		
			next();
		}

    	if(req.query.hasOwnProperty("index")) {
    		return index(req, res, next);
    	}
    	
    	if(req.query.hasOwnProperty("text")) {
    		// difference between serving, downloading and editing as text?
    		//		* http://localhost:44710/fs/Workspaces/configs/tomcat.xml
    		//		* http://localhost:44710/fs/Workspaces/configs/tomcat.xml?download&name=suggested_filename
    		//		* http://localhost:44710/fs/Workspaces/configs/tomcat.xml?json
    		//
    		//	list directory
    		//		* http://localhost:44710/fs/Workspaces/configs/
    	}
    	
        var recursive = req.params.recursive; // create an index 
        var file = req.params.file; // suggest name for downloading the file
        var encoding = req.params.encoding || 'utf-8';
        var position = req.params.position;
        var size = req.params.size; 
    	
		var uri = querystring.unescape(req.path().substring(base));
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
		var uri = querystring.unescape(req.path.substring(base));
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
		var uri = querystring.unescape(req.path.substring(base));
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
