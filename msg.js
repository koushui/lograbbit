
var http = require('http'),
	os = require('os'),
	getLocalIP = function () {
		var interfaces = os.networkInterfaces();
		
		for (var dev in interfaces) {
			for (var level in interfaces[dev]) {
				var localIP = interfaces[dev][level]['address'];
				if (localIP.match(/192\.168\./)) {
					return localIP;
				}
			}
		}
	},
	localIP = getLocalIP(),
	postURI = "/admin/loggerlist/" + localIP,
	updateURI = "/admin/loggerlist/" + localIP + "/_update",
	ESoption = {
		host: "192.168.21.241",
		port: 9200,
		method: "POST",
		headers: {
			"Content-Type": "json/application"
		}
		
	};

exports.online = function () {
	var option = ESoption;
	option.method = "GET";
	option.path = postURI;
	
	var req = http.request(option, function(res){
		var data = '';
		res.setEncoding('utf-8');
		res.on('data', function(chunk){
			data += chunk;
		});
		res.on('end', function(){
			var bodyObj = JSON.parse(data),
				exist = bodyObj.found;
			if (!exist) {
				cosole.log('[INFO] Not found logger, trying to add a new one');
				option.path = postURI;
				option.method = "POST";
				var req2 = http.request(option),
				body = {};
				body.ip = localIP;
				body.type = 'default';
				body.name = 'unamed';
				body.groupname = 'ungrouped';
				body.platform = process.platform;
				body.online = 'Yes';
				req2.end(JSON.stringify(body));
			} else {
				console.log('[INFO] Found logger, trying to set it online');
				option.method = "POST";
				option.path = updateURI;
				var req2 = http.request(option),
				body = {doc:{}};
				body.doc.online = 'Yes';
				req2.end(JSON.stringify(body));
			}
		});
	});
	req.on('error', function() {
		console.log('problem with request:' + e.message);
	})
	req.end();
}

exports.offline = function () {
	var option = ESoption,
		body = {doc:{}};
		
	body.doc.online = 'No';
	option.path = updateURI;
	option.method = "POST";
	console.log('[INFO] Trying to set logger offline');
	var req = http.request(option);
	
	req.end(JSON.stringify(body));
}


