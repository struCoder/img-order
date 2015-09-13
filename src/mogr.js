module.exports =  {
	format: function() {
		return function() {
			var imgExt = argsArr[1];
			if (cache.imageType.indexOf(imgExt) !== -1) {
				return mode0(imgExt);
			}
			endReq({msg: 'illegal image types', code: 8}, res);
			gm(imagePath).stream(ext, function(err, stdout) {
				lib.pipeStream(stdout, res)
			});
		}
	}
}
