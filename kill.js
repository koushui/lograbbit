/**
*	预定义windows和linux下结束进程的方法
*/

var psTree = require('ps-tree'),
	proc = require('child_process');
// linux
exports.ukill = function (pid, signal, callback) {
	signal   = signal || 'SIGKILL';
	callback = callback || function () {};
	var killTree = true;
	if(killTree) {
		psTree(pid, function (err, children) {
			[pid].concat(
				children.map(function (p) {
					return p.PID;
				})
			).forEach(function (tpid) {
				try { process.kill(tpid, signal) }
				catch (ex) { }
			});
			callback();
		});
	} else {
		try { process.kill(pid, signal) }
		catch (ex) { }
		callback();
	}
};
//windows
exports.wkill = function(pid){
	proc.exec('taskkill /PID ' + pid + ' /T /F', function(error, stdout, stderr){
		console.log('[INFO]: ' + stdout);
		console.log('[ERROR]: ' + stderr);
			if(error !== null) {
				 console.log('exec error: ' + error);
			}
		});
}