'use strict';

const fs = require('fs');

exports.endReq = function(res, msg) {
  let resData = {
    code: -1,
    msg: msg
  };
  res.statusCode = 400;
  return res.end(JSON.stringify(resData));
}

exports.setHeader = function(res, mime, cache, utcStr) {
  res.setHeader('Content-Type', 'image/' + mime);
  res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
  utcStr && res.setHeader('Last-Modified', utcStr);
}

exports.pipeStream = function(stream, res, mime, cache) {
  exports.setHeader(res, mime, cache);
  if (cache.tempImgDir && cache.cacheImagePath) {
    var imagePath = cache.cacheImagePath;
    imagePath = imagePath.substring(0, imagePath.lastIndexOf('.')) + '.' + mime;
    var writeStream = fs.createWriteStream(imagePath);
    stream.pipe(writeStream);
  }
  stream.pipe(res);
}
