var fs = require('fs');

function endReq(data, res) {
  var returnJson = {};
  data.code = data.code || 0;
  returnJson.code = data.code;
  returnJson.msg = data.msg || "";
  res.statusCode = 400;
  return res.end(JSON.stringify(returnJson));
}

function setHeader(res, mime, cache, utcStr) {
  res.setHeader('Content-Type', 'image/' + mime);
  res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
  utcStr && res.setHeader('Last-Modified', utcStr);
}

function pipeStream(stream, res, mime, cache) {
  setHeader(res, mime, cache);
  if (cache.tempImgDir && cache.cacheImagePath) {
    var imagePath = cache.cacheImagePath;
    imagePath = imagePath.substring(0, imagePath.lastIndexOf('.')) + '.' + mime;
    var writeStream = fs.createWriteStream(imagePath);
    stream.pipe(writeStream);
  }
  stream.pipe(res);
}

exports.endReq = endReq;
exports.setHeader = setHeader;
exports.pipeStream = pipeStream;
