var fs = require('fs'),
	http = require('http'),
	spawn = require('child_process').spawn,
	path = require('path'),
	url = require('url'),
	kill = require('./kill.js'), //结束程序用
	html = require('./html.js'), //用于生成html的模板
	msg = require('./msg.js'), //用于发送上线和下线消息
	logstash, //监测logstash是否运行
	isWin = /^win/.test(process.platform),
	defaultFilename = 'default.conf', // 默认配置文件
	listenPort = process.argv[2] == undefined ? 3000 : process.argv[2]; 02

http.createServer(function (req, res) {
	
	var pathname = url.parse(req.url, true).pathname,
		hostname = url.parse(req.url).host,
		query = url.parse(req.url, true).query;
	console.log('[INFO] request for url: '+ req.method + ' ' + req.url);
	if ('/' == pathname) {
		res.writeHead(200, {'Content-Type':'text/html;charset=UTF-8'})
		res.write(html.head('总览'));
		res.write('<h3>~兔子开始工作了~</h3>');
		res.write('<b>[服务器信息]</b><br/>');
		res.write('运行平台: ' + process.platform + '<br/>');
		var status = !(logstash == undefined) ? '运行中' : '未运行',
			switcher = !(logstash == undefined) ? '<a href="/end">停止</a>' : '<a href="/start">启动</a>';
		res.write('Logstash 状态: '+ status + '<br/>');
		res.write('<a href="/view">查看</a>&nbsp|&nbsp' + switcher + '&nbsplogstash');
		res.end(html.foot());
	} else if ('/start' == pathname) {
		if (query.conf != undefined) {
			var conf = query.conf;
		} else {
			conf = defaultFilename;
		}
		if (logstash == undefined) {
			if (isWin) {
				logstash = spawn('cmd', ['/c', '..\\logstash.bat', 'agent', '-f', '../'+ conf]);
			} else {
				logstash = spawn('../logstash', ['agent', '-f', '../' + conf]);
			}
			
			logstash.stdout.on('data', function (data) {
			  console.log('[INFO]: ' + data);
			});

			logstash.stderr.on('data', function (data) {
			  console.log('[ERROR]: ' + data);
			});

			logstash.on('close', function (code) {
			  console.log('[INFO] child process exited with code ' + code);
			  logstash = undefined;
			});
			console.log('[INFO] trying to start logstash with config file [' + conf +']...');
			msg.online();
			res.end(html.info('以配置文件[' + conf +']启动logstash'));
		} else {
			res.end(html.error('logstash已经启动!'));
		}
	} else if ('/end' == pathname){
		if (logstash != undefined) {
			logstash.on('exit', function(code) {
				res.end(html.info('logstash已退出，退出码：' + code));
			});
			if (isWin) {
				kill.wkill(logstash.pid);
			} else {
				kill.ukill(logstash.pid);
			}
			logstash = undefined;
			msg.offline();
		} else {
			res.end(html.error('logstash并未启动...'));
		}
	} else if ('/view' == pathname) {
		var name = query.name;
		if (name != undefined) {
			if (path.extname(name) != '.conf'){
				res.end(html.error('查看的文件必须以.conf为后缀...'));
			}
			fs.exists('../' + name, function(exists) {
				if (exists) {
					fs.readFile('../' + name, 'utf8', function(err, data){
						if (err) throw err;
						res.end(html.editbox(name, data));
					});
				} else {
					
					res.end(html.error('对应的文件不存在!'));
				}
			});
			
		} else {
			fs.readdir('../', function(err, files) {
				if (err) throw err;
				
				res.writeHead(200, {'Content-Type':'text/html'});
				res.write(html.head('配置文件列表'));
				res.write('<h3>logstash目录下的配置文件列表</h3>');
				files.forEach(function (file){
					if (path.extname(file) == '.conf') {
						res.write('<a href="/view?name=' + file + '">编辑</a>&nbsp' + '<a href="/start?conf=' + file + '">启动</a>&nbsp<a href="/delete?name=' + file +'">删除</a>&nbsp');
						if (file == defaultFilename) {
							res.write('<b>' + file + '</b><br />');
						} else {
							res.write(file + '<br />')
						}
					}
				});
				res.write('<a href="/">返回</a>');
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
				fs.writeFile('../' + filename, post['file'], function(err) {
					if (err) throw err;
					console.log('[INFO] uploaded file: '+ filename);
					res.end(html.info('文件上传成功!'));
				});
			} else {
				res.end(html.error('不是一个有效的配置文件...'));
			}
		});
	} else if ('/delete' == pathname) {
		var name = query.name;
		if (name == undefined) {
			res.end(html.error('必须提供有效的文件名 ...'));
		} else {
			if (path.extname(name) != '.conf'){
				res.end(html.error('要删除的文件必须以.conf为后缀...'));
			}
			fs.exists('../' + name, function(exists) {
				if (exists) {
					fs.unlink('../' + name, function(err, data){
						if (err) throw err;
						res.end(html.info('删除文件成功!'));
					});
				} else {
					res.end(html.error('该文件不存在!'));
				}
			});
		}
	} else {
		res.writeHead(404);
		res.end(html.error('未找到处理URL ' + req.url + '的模块'));
	}
}).listen(listenPort); 
console.log("[INFO] Server started..." + 'Listening Port: ' + listenPort);
console.log("[INFO] Platform is windows:" + isWin);

