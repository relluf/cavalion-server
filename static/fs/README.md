# /fs folder

The /fs _folder_ is the root folder of a file system exposed through a simple API (-[described here](https://google.com/?q=please%20describe)-) served at the /fs _endpoint_ . One might create symbolic links to directories here in order to unlock source codes for editing using the web application being served at /code. For example:

* `cd static`
* `ln -s ~/Dropbox Dropbox`
* `ln -s ~/Downloads Downloads`
* `ln -s ~/Projects Projects`

**Notes:** 

* The files and folder linked here become CRUD-ly accessible through the Navigator in the /code application.

* There is no need to restart your server while changing the contents of this folder. Simply refresh the Navigator or reload the /code application in your browser.
