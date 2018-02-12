# cavalion-server

A [restify](http://restify.com/) and/or [express](http://expressjs.com) based server serving the following services, applications and resources:

* [/code](https://github.com/relluf/cavalion-code) - Coding in the browser
* /fs - CRUD interface to part of the file system
* /home - /fs statically served (temporary hack)
* /shared - some shared resources (to be refactored)

## Installation

Perform the following commands in your favorite shell:

	$ git clone https://github.com/relluf/cavalion-server.git
	$ cd cavalion-server
	$ npm install
	$ ./first-run
	$ node src/server-express

Now open [http://localhost:44710/code](http://localhost:44710/code/) in your favorite browser to start coding in the browser.
