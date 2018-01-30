echo --- Running: npm update
npm update

echo --- Running: npm install
npm install

cp src/restify/plugins/accept.js node_modules/restify/lib/plugins/accept.js 
echo --- Patched restify/plugins/accept: Client accepts everything \(for serving less\)

file=./static/fs/Downloads
if [ ! -L "$file" ]; then
	echo --- Linking file system folders in ./static/fs
	ln -s ~/Downloads static/fs/Downloads
	ln -s ~/Dropbox static/fs/Dropbox
	ln -s ~/Projects static/fs/Projects
fi

echo --- Building web app: /code
cd node_modules/cavalion-code/src
bower install
npm install
