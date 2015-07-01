var path = require('path');
var fs = require('fs');
var url = require('url');
var gm = require('gm');
var view = require('./view');
var mogr = require('./mogr');
var tools = require('./lib/tools');

/**
	* dest: absolute path to images folder
	* url: get customize image for example: customize-img
				 and the result is domain.com/customizeImg/image.jpg?imageView/1/w/200/h/200
	*	legalImg: jpg,jpeg,png,gif
	* tempImgDir: orderTemp
	* maxAge: 31536000

*/

var customizeImg = function(options) {
	var cache = {};
	var IMAGE_TYPES = 'jpg,jpeg,png,gif,bmp';
	var mode, arg;
	var defaultMaxAge = 60 * 60 * 24 * 30 * 6;// half an year
	var legalMode = [0, 1, 2, 3, 4, 5];
	return function(req, res, next) {
		var parsePath = url.parse(req.url, true);
		var pathName = parsePath.pathname;
		if (pathName.indexOf(options.url) === -1) {
			return next();
		}

		if (!cache.maxAge) {
			cache.maxAge = parseInt(options.maxAge, 10) || defaultMaxAge
		}
		if (!cache.imageType) {
			cache.imageType = options.legalImg || IMAGE_TYPES;
		}
		if (!cache.legalImg) {
			cache.legalImg = '(' + cache.imageType.replace(/\,/g, '|') + ')';
		}
		if (!cache.tempImgDir) {
			cache.tempImgDir = options.tempImgDir || null;
		}
		var reg = new RegExp("/" + options.url + "/(\\S+\\." + cache.legalImg + ")\?", 'i');
		var imgArgsArr = pathName.match(reg);
		if (imgArgsArr.length !== 3) {
			return tools.endReq(res, 'illegal mode', 1);
		}
		var imageName = imgArgsArr[1];
		var mime = 'image/' + imgArgsArr[2];
		var imagePath = path.join(options.dest, imageName);
		if (!fs.existsSync(imagePath)) {
			return tools.endReq(res, 'illegal mode', 1);
			return endReq(res, 'file not exist', 3);
		}
		var viewArgs = parsePath.search.substring(parsePath.search.indexOf('?') + 1);
		var argsArr = viewArgs.toLowerCase().split('/');

		mode = parseInt(argsArr[1], 10);
		if (options.tempImgDir) {
			var cacheImagePath = path.join(cache.tempImgDir, viewArgs.replace(/\//g, '') + imageName);
		}

		function endReq(msg, code) {
			var returnJson = {};
			code = code || 0;
			returnJson.code = code;
			returnJson.msg = msg || "";
			res.statusCode = 400;
			return res.end(JSON.stringify(returnJson));
		}

		var pipeStream = function(stream) {
			res.setHeader('Content-Type', mime);
			res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
			if (cache.tempImgDir) {
				var writeStream = fs.createWriteStream(cacheImagePath);
				stream.pipe(writeStream);
			}
			stream.pipe(res);
		}

		// mode0 was format function
		var mode0 = function(ext) {
			return gm(imagePath).stream(ext, function(err, stdout) {
				pipeStream(stdout)
			});
		}

		var prepareDeal = function() {
			var argsArrLen = argsArr.length;
			if (cache.tempImgDir && fs.existsSync(cacheImagePath)) {
				res.setHeader('Content-Type', mime);
				res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
				var readStream = fs.createReadStream(cacheImagePath);
				return readStream.pipe(res);
			}
			if (argsArr.indexOf("format") !== -1) {
				var imgExt = argsArr[1];
				if (cache.imageType.indexOf(imgExt) === -1 && argsArr.length === 2) {
					return endReq('illegal image types', 8);
				}
				return mode0(imgExt);
			}
			if (legalMode.indexOf(mode) === -1) {
				return endReq('illegal mode', 1);
			}

			if (argsArrLen < 4) {
				return endReq('illegal args', 2);
			}
			var _fun = argsArr.shift();
			switch(_fun) {
				case: 'imageview':
					view(argsArr,imagePath);
					break;
				case: 'imagemogr':
					mogr(argsArr, imagePath);
					break;
				default:
					return endReq('illegal interface', 9);
			}
		}
		prepareDeal();
	}
}

module.exports = customizeImg;
