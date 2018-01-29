npm update
npm install

echo --- Patching restify: Client accepts everything (for serving less)
cp src/restify/plugins/accept.js node_modules/restify/lib/plugins/accept.js 

ln -s ~/Downloads static/fs/Downloads
ln -s ~/Dropbox static/fs/Dropbox
ln -s ~/Workspaces static/fs/Workspaces

cd node_modules/cavalion-code/src
bower install
npm install
