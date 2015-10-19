/**
  * auth: strucoder
  * email: zdwloveschina@gmail.com
  * version: 0.7.0
  * github: github.com/struCoder
**/


var path = require('path');
var fs = require('fs');
var url = require('url');
var gm = require('gm');
var view = require('./view');
var mogr = require('./mogr');
var tools = require('./lib');
/**
  * dest: absolute path to images folder
  * url: get customize image for example: customize-img
         and the result is domain.com/customizeImg/image.jpg?imageView/1/w/200/h/200
  * legalImg: jpg,jpeg,png,gif
  * tempImgDir: orderTemp
  * maxAge: 31536000

*/

var customizeImg = function(options) {
  const IMAGE_TYPES = options.legalImg || 'jpg,jpeg,png,gif,bmp';
  const defaultMaxAge = 60 * 60 * 24 * 30 * 6;// half an year
  var cache = {
    maxAge: parseInt(options.maxAge, 10) || defaultMaxAge,
    imageType: IMAGE_TYPES,
    legalImg: '(' + IMAGE_TYPES.replace(/\,/g, '|') + ')',
    tempImgDir: options.tempImgDir || null
  };

  return function(req, res, next) {
    var arg;
    var parsePath = url.parse(req.url, true);
    var pathName = parsePath.pathname;
    if (pathName.indexOf(options.url) === -1) return next();
    var reg = new RegExp("/" + options.url + "/(\\S+\\." + cache.legalImg + ")\?", 'i');
    var imgArgsArr = pathName.match(reg);
    var imageName = imgArgsArr[1];
    var imagePath = path.join(options.dest, imageName);
    if (!fs.existsSync(imagePath)) {
      return tools.endReq({msg: 'file not exist',code: 3}, res);
    }
    var mime = imgArgsArr[2];
    var viewArgs = parsePath.search.substring(parsePath.search.indexOf('?') + 1);
    var argsArr = viewArgs.toLowerCase().split('/');

    var mode = parseInt(argsArr[1], 10);
    if (options.tempImgDir) {
      cache.cacheImagePath = path.join(cache.tempImgDir, viewArgs.replace(/\//g, '') + imageName);
    }

    function prepareDeal() {
      function fromCache() {
        if(argsArr[1] == 'format') {
          cache.cacheImagePath = cache.cacheImagePath.substring(0, cache.cacheImagePath.lastIndexOf('.')) + '.' + argsArr[2];
        }
        if (cache.tempImgDir && fs.existsSync(cache.cacheImagePath)) {
          var stats = fs.statSync(cache.cacheImagePath);
          var mtime = stats.mtime;
          var reqModDate = req.headers["if-modified-since"];
          if (reqModDate != null) {
            if (reqModDate === mtime.toUTCString()) {
              res.statusCode = 304;
              res.end();
            }
          } else {
            tools.setHeader(res, mime, cache, mtime.toUTCString());
            var readStream = fs.createReadStream(cache.cacheImagePath);
            readStream.pipe(res);
          }
          return true;
        }
        return false;
      }
      if (!fromCache()) {
        var _fun = argsArr.shift();
        switch(_fun) {
          case 'imageview':
            view(argsArr, imagePath, res, mime, cache, cache.cacheImagePath);
            break;
          case 'imagemogr':
            mogr(argsArr, imagePath, res, mime, cache, cache.cacheImagePath);
            break;
          default:
            return tools.endReq({msg: 'illegal interface', code: 9}, res);
        }
      }
    }
    prepareDeal();
  }
}

module.exports = customizeImg;
