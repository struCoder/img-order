var path = require('path');
var fs = require('fs');
var url = require('url');
var gm = require('gm');

/*
 * dest: absolute path to images folder
 * url: get customize image for example: customize-img
        and the result is domain.com/customizeImg/image.jpg?imageView/1/w/200/h/200
 * legalImg: jpg,jpeg,png,gif
 * tempImgDir: orderTemp
 * maxAge: 31536000
 */

var customizeImg = function(options) {
	var cache = {};
	var IMAGE_TYPES = 'jpg,jpeg,png,gif,bmp';
	var mode, arg;
	var defaultMaxAge = 60 * 60 * 24 * 30 * 6;// half a year
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
			return endReq('illegal mode', 1);
		}
		var imageName = imgArgsArr[1];
		var mime = 'image/' + imgArgsArr[2];
		var imagePath = path.join(options.dest, imageName);
		if (!fs.existsSync(imagePath)) {
			return endReq('file not exist', 3);
		}
		var viewArgs = parsePath.search.substring(parsePath.search.indexOf('/') + 1);
		var argsArr = viewArgs.toLowerCase().split('/');
		var argsArrLen = argsArr.length;
		mode = parseInt(argsArr[0], 10);
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

		var mode1 = function(w, h) {
			//等比缩放, 不裁剪
			//no cropping
			gm(imagePath).size(function(err, size) {
				var originW = size.width;
				var originH = size.height;
				if (w && h) {
					if (w < originW || h < originH) {
						if (w / h > originW / originH) {
							w = (originW * h / originH).toFixed(1);
							this.resize(w, h)
									.stream(function(err, stdout) {
										pipeStream(stdout);
									});
						} else {
							h = (w * originH / originW).toFixed(1);
							this.resize(w, h)
									.stream(function(err, stdout) {
										pipeStream(stdout);
									});
						}
					} else {
						this.stream(function(err, stdout) {
									pipeStream(stdout);
								});
					}
				} else if (w || h) {
					var temp = w || h;
					if (temp > originW || temp > originH) {
						return this.stream(function(err, stdout) {
							pipeStream(stdout);
						});
					}
					
					h = h || (temp * originH / originW).toFixed(1);
					w = w || (originW * temp / originH).toFixed(1);
					this.resize(w, h)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
				}
			});
		} 

		var mode2 = function(w, h) {
			//等比缩放, 裁剪
			//cropping
			gm(imagePath).size(function(err, size){
				var originW = size.width;
				var originH = size.height;
				if (w && h) {
					if (w > originW && h > originH) {
						this.stream(function(err, stdout) {
							pipeStream(stdout);
						});
					} else {
						if (w <= originW && h >= originH) {
							h = originH
						} else if (w > originW && h < originH){
							w = originW
						}
						// this.out('-thumbnail', w + "x" + h + "^")
						this.resize(w, h, "^")
							.gravity("Center")
							.extent(w, h)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
					}
				} else {
					var temp = w || h;
					this.resize(temp, temp,"^")
							.gravity("Center")
							.extent(temp, temp)
							.stream(function (err, stdout) {
								pipeStream(stdout)
							});
				}
			});
		}

		var mode3 = function(w, h) {
			mode1(w, h);
		}

		var mode4 = function(w, h) {
			gm(imagePath).size(function(err, size) {
				var originW = size.width;
				var originH = size.height;
				if (w && h) {
					if (w > originW && h > originH) {
						this.stream(function(err, stdout) {
								pipeStream(stdout);
							});
					} else {
						if (w / h > originW / originH) {
							h = (w * originH / originW).toFixed(1);
						} else {
							w = (h * originW / originH).toFixed(1);
						}
						this.resize(w, h)
								.stream(function(err, stdout) {
									pipeStream(stdout);
								});
					}
				} else {
					var temp = w || h;
					if (temp > originW || temp > originH) {
						return this.stream(function(err, stdout) {
								pipeStream(stdout);
							});
					}
					//  1 means w === h 
					if (1 > originW / originH) {
						h = (temp * originH / originW).toFixed(1);
					} else {
						w = (temp * originW / originH).toFixed(1);
					}

					this.resize(w, h)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
				}
			});
		}

		var mode5 = function(w, h) {
			gm(imagePath).size(function(err, size) {
				var longEdje, shortEdje;
				if (size.width > size.height) {
					longEdje = size.width;
					shortEdje = size.height;
				}	else {
					shortEdje = size.width;
					longEdje = size.height;
				}
				if (w && h) {
					if (w / h > longEdje / shortEdje) {
						h = (w * shortEdje / longEdje).toFixed(1);
					} else {
						w  = (longEdje * h / shortEdje).toFixed(1);
					}
					this.resize(w, h)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
				} else {
					var temp = w || h;
					if (temp > longEdje) {
						return this.stream(function(err, stdout) {
								pipeStream(stdout);
							});
					}
					//  1 means w === h 
					if (1 > longEdje / shortEdje) {
						h = (temp * shortEdje / longEdje).toFixed(1);
					} else {
						w = (temp * longEdje / shortEdje).toFixed(1);
					}

					this.resize(w, h)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
				}
			});
		}

		var mode6 = function(w, h) {
			gm(imagePath).size(function(err, size) {
				var longEdje, shortEdje;
				if (size.width > size.height) {
					longEdje = size.width;
					shortEdje = size.height;
				}	else {
					shortEdje = size.width;
					longEdje = size.height;
				}
				if (w && h) {
					if (w > longEdje && h > shortEdje) {
						this.resize(w, h)
								.stream(function(err, stdout) {
									pipeStream(stdout);
								});
					} else {
						this.resize(w, h, "^")
								.gravity('Center')
								.extent(w, h)
								.stream(function(err, stdout) {
									pipeStream(stdout);
								});
					}
				} else {
					var temp = w || h;
					if (temp > longEdje) {
						return this.stream(function(err, stdout) {
								pipeStream(stdout);
							});
					}
					this.resize(temp, temp, "^")
							.gravity('Center')
							.extent(temp,temp)
							.stream(function(err, stdout) {
								pipeStream(stdout);
							});
				}			
			});
		}


		var parpareDeal = function() {
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

			if (argsArrLen < 3) {
				return endReq('illegal args', 2);
			}

			var indexOfW = argsArr.indexOf('w');
			var indexOfH = argsArr.indexOf('h');
			var w, h;
			if (argsArrLen === 3) {
				if (indexOfW !== -1) {
					w = parseInt(argsArr[indexOfW + 1], 10);
					h = null;
					if (isNaN(w)) {
						return endReq('illegal arg w', 1);
					}
				} else {
					h = parseInt(argsArr[indexOfH + 1], 10);
					if (isNaN(h)) {
						return endReq('illegal arg h', 1);
					}
					w = null;
				}
			} else if (argsArrLen === 5) {
					w = parseInt(argsArr[indexOfW + 1], 10);
					h = parseInt(argsArr[indexOfH + 1], 10);
					if (isNaN(w) || isNaN(h)) {
						return endReq('illegal args', 1);
					}
			} else {
				return endReq('illegal mode', 1);
			}
			
			switch (mode) {
				case 0:
					mode1(w, h);
					break;
				case 1:
					mode2(w, h);
					break;
				case 2:
					mode3(w, h);
					break;
				case 3:
					mode4(w, h);
					break;
				case 4:
					mode5(w, h);
					break;
				case 5:
					mode6(w, h);
					break;
				default:
					endReq('end', 9);
			}
		}
		parpareDeal();
	}
}

module.exports = customizeImg;
