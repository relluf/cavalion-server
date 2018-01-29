npm update
npm install

echo patching restify for less
cp src/restify/plugins/accept.js node_modules/restify/lib/plugins/accept.js 

cd node_modules/cavalion-code/src
bower install
npm install