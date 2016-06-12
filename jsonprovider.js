var http = require('http');
var path = require('path');
var fs = require('fs-extra');
var colors = require('colors');
var stdio = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

http.createServer(function (req, res) {
	var url = req.url;
	var urlSplit = url.indexOf('?');
	var filename = path.join(process.cwd(), 'json', urlSplit < 0 ? url : url.slice(0, urlSplit));
	if (!fs.existsSync(filename))
		return HTTPResponse(res, 404);
	if (fs.statSync(filename).isFile())
		return HTTPResponse(res, 200, fs.readFileSync(filename));
	var list = fs.readdirSync(filename).sort();
	console.log('Request JSON set:');
	for (var i = 0; i < list.length; i++) 
		console.log(('\t[' + i + '] ' + list[i]).cyan);
	stdio.question('Please input a number to select which JSON file will be response > ',
		function (ans) {
			var id = parseInt(ans);
			if (!list[id])
				return console.error('Please input a correct number!'.red) || HTTPResponse(res, 500);
			var file = path.join(filename, list[id]);
			if (!fs.statSync(file).isFile())
				return console.error('Please select a JSON file!'.red) || HTTPResponse(res, 500);	
			return HTTPResponse(res, 200, fs.readFileSync(path.join(filename, list[id])));
	});
}).listen(2333);


function HTTPResponse(res, status, content) {
	res.writeHead(status, {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json;charset: utf-8',	
	});
	content && res.write(content);
	res.end();
}