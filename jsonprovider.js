#!/usr/bin/env node

//@ts-check
const PORT = 2333;

let http = require('http'),
	path = require('path'),
	fs = require('fs'),
	readline = require('readline');

(process.argv.indexOf('--help') > 0 || process.argv.indexOf('-h') > 0 ) && help();
let port = parseInt(process.argv[2]);
if (isNaN(port) || port < 0 || port > 65536) port = PORT;

http.createServer((req, res) => {
	let filename = getJSONPathFromURL(req.url);
	if (isFile(filename)) return responseJSONFile(res,filename);
	if (isFile(filename + '.json')) return responseJSONFile(res,filename + '.json');
	if (!isDirectory(filename)) return response(res, 404);

	let list = fs.readdirSync(filename).sort();
	console.log('Request JSON set:\n' + list.map((item, i) => `  [${i}] ${item}`).join('\n'));

	let stdio = readline.createInterface({ input: process.stdin, output: process.stdout });
	stdio.question('Please input a number to select which JSON file will be response > ', id => {
		stdio.close();

		if (!(id in list)) return response500('Please input a correct number!');
		let file = path.join(filename, list[id]);
		if (!isFile(file)) return response500('Please select a JSON file!');	
		return responseJSONFile(res,file);
	});
}).listen(PORT);
console.log(`JSON Server start in port ${PORT}`);

function isFile(file) { return fs.existsSync(file) && fs.statSync(file).isFile(); }
function isDirectory(file) { return fs.existsSync(file) && fs.statSync(file).isDirectory(); }

function getJSONPathFromURL(url) { 
	let i = url.indexOf('?');
	return path.join(process.cwd(), 'json', i < 0 ? url : url.slice(0, i));
}

function response500(res, error) { console.error(error); response(res, 500); }
function responseJSONFile(res, filename) { response(res, 200, fs.readFileSync(filename)); }
function response(res, status, content) {
	res.writeHead(status, {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json;charset: utf-8',	
	});
	content && res.write(content);
	res.end();
}

function help() { 
	console.log([
		`Usage: jsonprovider [port=${PORT}]\n`,
		`Start a json provide server \n`
	].join('\n'));
	process.exit(0);
}