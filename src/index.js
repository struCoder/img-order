'use strict';
/**
  * auth: strucoder
  * email: zdwloveschina@gmail.com
  * version: 1.0.0
  * github: github.com/struCoder
**/


const path = require('path');
const fs = require('fs');
const url = require('url');
const view = require('./view');
const mogr = require('./mogr');
const tools = require('./lib');
/**
  * dest: absolute path to images folder
  * url: get customize image for example: customize-img
         and the result is domain.com/customizeImg/image.jpg?imageView/1/w/200/h/200
  * legalImg: jpg,jpeg,png,gif
  * tempImgDir: orderTemp
  * maxAge: 31536000

*/

const customizeImg = function(options) {
  const IMAGE_TYPES = options.legalImg || 'jpg,jpeg,png,gif,bmp';
  const defaultMaxAge = 60 * 60 * 24 * 30 * 6;// half an year
  const cache = {
    maxAge: parseInt(options.maxAge, 10) || defaultMaxAge,
    imageType: IMAGE_TYPES,
    legalImg: '(' + IMAGE_TYPES.replace(/\,/g, '|') + ')',
    tempImgDir: options.tempImgDir || null
  };
  
  if (cache.tempImgDir && !fs.existsSync(cache.tempImgDir)) {
    throw new Error('tempImgDir must be exist');
  }

  // from bowser or cache dir
  function fromCache(req, res, format, cache, mime) {
    const cacheImagePath = cache.cacheImagePath;
    if(format == 'format') {
      cacheImagePath = cacheImagePath.substring(0, cacheImagePath.lastIndexOf('.')) + '.' + argsArr[2];
    }
    if (cache.tempImgDir && fs.existsSync(cacheImagePath)) {
      const stats = fs.statSync(cacheImagePath);
      const mtime = stats.mtime;
      const reqModDate = req.headers["if-modified-since"];
      if (reqModDate != null) {
        if (reqModDate === mtime.toUTCString()) {
          res.statusCode = 304;
          res.end();
        }
      } else {
        tools.setHeader(res, mime, cache, mtime.toUTCString());
        fs.createReadStream(cacheImagePath).pipe(res);
      }
      return true;
    }
    return false;
  }
  return function(req, res, next) {
    var arg;
    var parsePath = url.parse(req.url, true);
    var pathName = parsePath.pathname;
    if (pathName.indexOf(options.url) === -1) return next();
    const reg = new RegExp("/" + options.url + "/(\\S+\\." + cache.legalImg + ")\?", 'i');
    const imgArgsArr = pathName.match(reg);
    const imageName = imgArgsArr[1];

    const imagePath = path.join(options.dest, imageName);

    // check file isexist
    if (!fs.existsSync(imagePath)) {
      return tools.endReq(res, 'file not exist');
    }

    const mime = imgArgsArr[2];
    const viewArgs = parsePath.search.substring(parsePath.search.indexOf('?') + 1);
    const argsArr = viewArgs.toLowerCase().split('/');

    if (options.tempImgDir) {
      cache.cacheImagePath = path.join(cache.tempImgDir, viewArgs.replace(/\//g, '') + imageName);
    }


    if (!fromCache(req, res, argsArr[1], cache, mime)) {
      var _fun = argsArr.shift();
      switch(_fun) {
        case 'imageview':
          view(argsArr, imagePath, res, mime, cache);
          break;
        case 'imagemogr':
          mogr(argsArr, imagePath, res, mime, cache);
          break;
        default:
          return tools.endReq(res, 'illegal interface');
      }
    }
  }
}

module.exports = customizeImg;
