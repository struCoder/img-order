var gm = require('gm');
var tools = require('./lib');

module.exports = function(argsArr, imagePath, res, mime, cache) {

  function autoOrient() {
    gm(imagePath).autoOrient().stream(function(err, stdout) {
      tools.pipeStream(stdout, res, mime, cache);
    });
  }

  function blur(argStr) {
    var _args = argStr.split('x');
    if (_args.length !== 2) {
      tools.endReq({
        msg: 'args wrong'
      }, res);
      return
    }
    var radius = _args[0];
    var sigma = _args[1];
    if (radius < 1 || radius > 50) {
      return tools.endReq({
        msg: 'radius should between 1 and 50',
        code: 1
      }, res);
    }
    sigma = sigma || 1;
    gm(imagePath)
      .blur(radius, sigma)
      .stream(function(err, stdout) {
        tools.pipeStream(stdout, res, mime, cache);
      });
  }

  function strip() {
    gm(imagePath).strip().stream(function(err, stdout) {
      tools.pipeStream(stdout, res, mime, cache);
    });
  }

  function interlace(type) {
    var _temp = '01';
    if (_temp.indexOf(type) === -1) {
      tools.endReq({
        msg: 'wrong args'
      }, res);
      return;
    }
    type = parseInt(type, 10);
    type = type || 'None';
    gm(imagePath).interlace(type).stream(function(err, stdout) {
      tools.pipeStream(stdout, res, mime, cache);
    });
  }

  function quality(v) {
    v = parseInt(v, 10);
    v = v || 85;
    if (v < 1 || v > 100) {
      tools.endReq({
        msg: 'the value should between 1 and 100',
        code: 1
      }, res);
      return;
    }
    gm(imagePath).quality(v).stream(function(err, stdout) {
      tools.pipeStream(stdout, res, mime, cache);
    });
  }

  function format(type) {
    if (cache.imageType.indexOf(type) === -1) {
      tools.endReq({
        msg: 'invalid type, support: ' + cache.imageType
      }, res);
      return;
    }
    gm(imagePath).stream(type, function(err, stdout) {
      tools.pipeStream(stdout, res, type, cache);
    })
  }


  switch (argsArr[0]) {
    case 'format':
      format(argsArr[1]);
      break;
    case 'strip':
      strip();
    case 'quality':
      quality(argsArr[1]);
      break;
    case 'blur':
      blur(argsArr[1]);
      break;
    case 'interlace':
      interlace(argsArr[1]);
      break;
    case 'autoorient':
      autoOrient();
      break;
    default:
      tools.endReq({msg: 'illegal interface', code: 9}, res);
      return;
  }
}
