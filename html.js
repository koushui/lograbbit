// html文件头
var htmlhead = function(title) {
	var html = '<html><head><title>' + title +'</title>'+
	'<style type="text/css">' +
		'body{font-family:Consolas, 微软雅黑}' + 
		'a:link {color: #99F; text-decoration: none}' +	
		'a:visited {color: #99F; text-decoration: none}' +	
		'a:hover {color: #99F; text-decoration: underline}' +
		'a:active {color: #99F; text-decoration: none}' +
	'</style>' +
	'<meta http-equiv="content-type" content="text/html; charset=UTF-8" /></head>' +
	'<body>';
	return html;
};
exports.head = htmlhead;
// html文件尾
var htmlfoot = function() {
	var html = '</body></html>';
	return html;
};
exports.foot = htmlfoot;

// 错误
exports.error = function (err) {
	var html = htmlhead('Error') +
	'<h3>Something wrong happen...</h3>' +
	err +'<br><a href="/">Back</a>'
	htmlfoot();
	return html;
}
// 消息
exports.info = function (err) {
	var html = htmlhead('Information') +
	'<h3>It seems to work...</h3>' +
	err +'<br><a href="/">Back</a>'
	htmlfoot();
	return html;
}
// 编辑器
exports.editbox = function (filename, content) {
	var html = htmlhead('EditBox') +
	'<form name="editbox" action="/upload" method="POST"><textarea style="width:100%; height:400px; resize:none" name="file">' + content + '</textarea>' +
	'<input type="text" name="name" style="width:100%" value="' + filename + '" />' +
	'<a href="javascript:void" onclick ="document.forms[\'editbox\'].submit()">pdate</a>&nbsp<a href="/view">返回</a></form>' +
	htmlfoot();
	return html;
}