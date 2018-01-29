'use strict';

var restify = require('restify');
var fs = require('fs');
var filesystem = require('file-system');
var rimraf = require('rimraf');
var mime = require('mime');
var mixin = require('mixin-object');
var md5 = require('md5');

function salt(message) {
	var pre = "c4v4710n";
	var post = "44700";
	return md5(pre + message + post);
}

function handleError(res, err) {
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

	server.get("/" + base + "/index", function(req, res, next) {
		res.send(500);
		next();
	});
    server.get(re, function(req, res, next) {
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


            // fs.readdir(path, function (err, files) {
            //     if (err) {
            //         resError(101, err, res);
            //     } else {

            //         // Ensure ending slash on path
            //         (path.slice(-1)!=="/") ? path = path + "/" : path = path;

            //         var output = {},
            //             output_dirs = {},
            //             output_files = {},
            //             current,
            //             relpath,
            //             link;

            //         // Function to build item for output objects
            //         var createItem = function (current, relpath, type, link) {
            //             return {
            //                 path: relpath.replace('//','/'),
            //                 type: type,
            //                 size: fs.lstatSync(current).size,
            //                 atime: fs.lstatSync(current).atime.getTime(),
            //                 mtime: fs.lstatSync(current).mtime.getTime(),
            //                 link: link
            //             };
            //         };

            //         // Sort alphabetically
            //         files.sort();

            //         // Loop through and create two objects
            //         // 1. Directories
            //         // 2. Files
            //         for (var i=0, z=files.length-1; i<=z; i++) {
            //             current = path + files[i];
            //             relpath = current.replace(config.base,"");
            //             (fs.lstatSync(current).isSymbolicLink()) ? link = true : link = false;
            //             if (fs.lstatSync(current).isDirectory()) {
            //                 output_dirs[files[i]] = createItem(current,relpath,"directory",link);
            //             } else {
            //                 output_files[files[i]] = createItem(current,relpath,"file",link);
            //             }
            //         }

            //         // Merge so we end up with alphabetical directories, then files
            //         output = merge(output_dirs,output_files);

            //         // Send output
            //         resSuccess(output, res);
            //     }
            // });
