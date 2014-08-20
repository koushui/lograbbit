var fs = require('fs'),
	http = require('http'),
	spawn = require('child_process').spawn,
	path = require('path'),
	url = require('url'),
	kill = require('./kill.js'),
	html = require('./html.js'),
	logstash, //监测logstash是否运行
	isWin = /^win/.test(process.platform);
	

http.createServer(function (req, res) {
	
	var pathname = url.parse(req.url, true).pathname,
		hostname = url.parse(req.url).host,
		query = url.parse(req.url, true).query;
	console.log('[INFO] request for url: '+ req.method + ' ' + req.url);
	if ('/' == pathname) {
		res.writeHead(200, {'Content-Type':'text/html;charset=UTF-8'})
		res.write(html.head('Overview'));
		res.write('<h3>~Server is working~</h3>');
		res.write('<b>[Server Information]</b><br/>');
		res.write('Platform: ' + process.platform + '<br/>');
		var status = !(logstash == undefined) ? 'Running' : 'Not running',
			switcher = !(logstash == undefined) ? '<a href="/end">Terminate</a>' : '<a href="/start">Start</a>';
		res.write('Logstash status: '+ status + '<br/>');
		res.write('<a href="/view">View</a>&nbsp|&nbsp' + switcher + '&nbsplogstash');
		res.end(html.foot());
	} else if ('/start' == pathname) {
		if (query.conf != undefined) {
			var conf = query.conf;
		} else {
			conf = 'apache-ws.conf';
		}
		if (logstash == undefined) {
			if (isWin) {
				logstash = spawn('cmd', ['/c', 'logstash.bat', 'agent', '-f', conf]);
			} else {
				logstash = spawn('./logstash', ['agent', '-f', conf]);
			}
			
			logstash.stdout.on('data', function (data) {
			  console.log('[INFO]: ' + data);
			});

			logstash.stderr.on('data', function (data) {
			  console.log('[ERROR]: ' + data);
			});

			logstash.on('close', function (code) {
			  console.log('[INFO] child process exited with code ' + code);
			});
			console.log('[INFO] trying to start logstash with confing file [' + conf +']...');
			res.end(html.info('starting logstash with config file [' + conf +']'));
		} else {
			res.end(html.error('logstash has been started!'));
		}
	} else if ('/end' == pathname){
		if (logstash != undefined) {
			logstash.on('exit', function(code) {
				res.end(html.info('logstash stoped with code ' + code));
			});
			if (isWin) {
				kill.wkill(logstash.pid);
			} else {
				kill.ukill(logstash.pid);
			}
			logstash = undefined;
		} else {
			res.end(html.error('logstash hasn\'t been started...'));
		}
	} else if ('/view' == pathname) {
		var name = query.name;
		if (name != undefined) {
			if (path.extname(name) != '.conf'){
				res.end(html.error('the file to view must be a .conf file...'));
			}
			fs.exists(name, function(exists) {
				if (exists) {
					fs.readFile(name, 'utf8', function(err, data){
						if (err) throw err;
						res.end(html.editbox(name, data));
					});
				} else {
					
					res.end(html.error('no such file!'));
				}
			});
			
		} else {
			fs.readdir('.', function(err, files) {
				if (err) throw err;
				
				res.writeHead(200, {'Content-Type':'text/html'});
				res.write(html.head('List of Config'));
				res.write('<h3>list of config files in logstash directory</h3>');
				files.forEach(function (file){
					if (path.extname(file) == '.conf') {
						res.write('<a href="/view?name=' + file + '">Edit</a>&nbsp' + '<a href="/start?conf=' + file + '">Run</a>&nbsp' + file + '<br />');
					}
				});
				res.write('<a href="/">Back</a>');
				res.end(html.foot());
			});
		}
	} else if ('/upload' == pathname && req.method == 'POST') {
		var body = '',
			qs = require('querystring');
		req.on('data', function (data) {
			body += data;
		});
		req.on('end', function () {
			var post = qs.parse(body),
				filename = post['name'] == undefined ? 'default.conf' : post['name'];
			if (path.extname(post['name']) == '.conf') {
				fs.writeFile(filename, post['file'], function(err) {
					if (err) throw err;
					console.log('[INFO] uploaded file: '+ filename);
					res.end(html.info('File uploaded successful!'));
				});
			} else {
				res.end(html.error('It isn\'t a config file...'));
			}
		});
	} else {
		res.writeHead(404);
		res.end(html.error('No handler for url ' + req.url));
	}
}).listen(3000); 
console.log("[INFO] Server started...");
console.log("[INFO] Platform is windows:" + isWin);