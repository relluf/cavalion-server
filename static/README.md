# static folder

When [src/server.js](https://github.com/relluf/cavalion-server/blob/master/src/server.js) is running successfully, the following dynamic endpoints are available:

* [/fs](http://localhost:44710/fs) - simple API to a file system (dynamic)
* [/code](http://localhost:44710/code) - application for editing code
* [/shared](http://localhost:44710/shared) - shared stuff (to be refactored);
* [/home](http://localhost:44710/home) - link to /fs (static)

These endpoints are mapped to the folders in this folder.

## /fs folder

The /fs _folder_ is the root folder of a file system exposed through a simple API (-[described here](https://google.com/?q=please%20describe)-) served at the /fs _endpoint_ . One might create symbolic links to directories here in order to unlock source codes for editing using the web application being served at /code. For example:

* `cd static`
* `ln -s ~/Dropbox Dropbox`
* `ln -s ~/Downloads Downloads`
* `ln -s ~/Projects Projects`

**Notes:** 

* The files and folder linked here become CRUD-ly accessible through the Navigator in the /code application.

* There is no need to restart your server while changing the contents of this folder. Simply refresh the Navigator or reload the /code application in your browser.

## /code folder

Symbolic link to node_modules/cavalion-code/src.

## /shared folder

Some shared files that to need be refactored to other locations.

## /home folder

A symbolic link to ./fs. Whereas /fs (endpoint) exposes a (simple) file system, wrapped in JSON objects, /home serves the files and folders directly/statically.