var fs = require('fs');

function endReq(data, res) {
	var returnJson = {};
	data.code = data.code || 0;
	returnJson.code = data.code;
	returnJson.msg = data.msg || "";
	res.statusCode = 400;
	return res.end(JSON.stringify(returnJson));
}

function pipeStream(stream, res, mime, cache, cacheImagePath) {
	res.setHeader('Content-Type', mime);
	res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
	if (cache.tempImgDir) {
		var writeStream = fs.createWriteStream(cacheImagePath);
		stream.pipe(writeStream);
	}
	stream.pipe(res);
}

exports.endReq = endReq;
exports.pipeStream = pipeStream;
