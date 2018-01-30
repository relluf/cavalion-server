echo --- Running: npm update
npm update

echo --- Running: npm install
npm install

cp src/restify/plugins/accept.js node_modules/restify/lib/plugins/accept.js 
echo --- Patched restify/plugins/accept: Client accepts everything \(for serving less\)

file=./fs/Downloads
if [ ! -L "$file" ]; then
	echo --- Linking file system folders in ./fs
	ln -s ~/Downloads fs/Downloads
	ln -s ~/Dropbox fs/Dropbox
	ln -s ~/Projects fs/Projects
fi

echo --- Building web app: /code
cd node_modules/cavalion-code/src
bower install
npm install
