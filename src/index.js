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
	*	legalImg: jpg,jpeg,png,gif
	* tempImgDir: orderTemp
	* maxAge: 31536000

*/

var customizeImg = function(options) {
	const IMAGE_TYPES = options.legalImg || 'jpg,jpeg,png,gif,bmp';
	const defaultMaxAge = 60 * 60 * 24 * 30 * 6;// half an year
	const legalMode = [0, 1, 2, 3, 4, 5];
	var cache = {
		maxAge: parseInt(options.maxAge, 10) || defaultMaxAge,
		imageType: IMAGE_TYPES,
		legalImg: '(' + IMAGE_TYPES.replace(/\,/g, '|') + ')',
		tempImgDir: options.tempImgDir || null

	};

	return function(req, res, next) {
		var mode, arg;
		var parsePath = url.parse(req.url, true);
		var pathName = parsePath.pathname;
		if (pathName.indexOf(options.url) === -1) return next();
		var reg = new RegExp("/" + options.url + "/(\\S+\\." + cache.legalImg + ")\?", 'i');
		var imgArgsArr = pathName.match(reg);
		if (imgArgsArr.length !== 3) {

			return tools.endReq({msg: 'illegal mode', code: 1}, res);
		}
		var imageName = imgArgsArr[1];
		var imagePath = path.join(options.dest, imageName);
		if (!fs.existsSync(imagePath)) {
			return tools.endReq({msg: 'file not exist',code: 3}, res);
		}
		var mime = 'image/' + imgArgsArr[2];
		var viewArgs = parsePath.search.substring(parsePath.search.indexOf('?') + 1);
		var argsArr = viewArgs.toLowerCase().split('/');

		mode = parseInt(argsArr[1], 10);
		if (options.tempImgDir) {
			var cacheImagePath = path.join(cache.tempImgDir, viewArgs.replace(/\//g, '') + imageName);
		}

		function prepareDeal() {
			function checkCache() {
				if (cache.tempImgDir && fs.existsSync(cacheImagePath)) {
					res.setHeader('Content-Type', mime);
					res.setHeader('Cache-Control', 'public, max-age=' + cache.maxAge);
					var readStream = fs.createReadStream(cacheImagePath);
					readStream.pipe(res);
					return true;
				}
				return false;
			}
			if (!checkCache()) {
				if (legalMode.indexOf(mode) === -1) {
					return tools.endReq({msg: 'illegal mode', code: 1}, res);
				}
				var _fun = argsArr.shift();
				switch(_fun) {
					case 'imageview':
						view()();
						break;
					case 'imagemogr':
						mogr()();
						break;
					case 'format':
						mogr.format()()
					default:
						return tools.endReq({msg: 'illegal interface', code: 9}, res);
				}
			}
		}
		prepareDeal();
	}
}

module.exports = customizeImg;
