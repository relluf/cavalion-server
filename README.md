# cavalion-server

A [restify](http://restify.com/) based server serving the following services, applications and resources:

* [/code](https://github.com/cavalion-code) - Coding in the browser
* /fs - CRUD interface to part of the file system
* /home - /fs statically served (temporary hack)
* /shared - some shared resources (to be refactored)

## Installation

Perform the following command in your favorite shell:

	$ git clone https://github.com/relluf/cavalion-server.git
	$ cd cavalion-server
	$ ./make
	$ node src/server

Now open [http://localhost:44710/code](http://localhost:44710/code/) in your favorite browser to start coding in the browser.
