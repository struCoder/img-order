var gm = require('gm');
var tools = require('./lib');


var mogr = module.exports = _mogr;

mogr.autoOrient = function (imagePath, cb) {
  gm(imagePath).autoOrient().stream(function(err, stdout) {
    cb(err, stdout);
  });
}


mogr.blur = function(imagePath, radius, sigma, cb) {
  gm(imagePath).blur(radius, sigma).stream(function(err, stdout) {
      cb(err, stdout);
  });
}

mogr.strip = function(imagePath, cb) {
  gm(imagePath).strip().stream(function(err, stdout) {
    cb(err, stdout);
  });
}


mogr.interlace = function(imagePath, type, cb) {
  gm(imagePath).interlace(type).stream(function(err, stdout) {
    cb(err, stdout);
  });
}


mogr.quality = function(imagePath, v, cb) {
  gm(imagePath).quality(v).stream(function(err, stdout) {
    cb(err, stdout);
  });
}

mogr.format = function(imagePath, type, cb) {
  gm(imagePath).stream(type, function(err, stdout) {
    cb(err, stdout);
  });
}

mogr.rotate = function(imagePath, deg, cb) {
  gm(imagePath).rotate('white', deg).stream(function(err, stdout) {
    cb(err, stdout);
  });
}

mogr.crop = function(imagePath, w, h, x, y, cb) {
  gm(imagePath).size(function(err, size) {
    var originW = size.width;
    var originH = size.height;
    if (x > originW || y > originH) {
      this.stream(function(err, stdout) {
        cb(err, stdout);
      })
    } else {
      this.crop(x, y, w, h).stream(function(err, stdout) {
        cb(err, stdout);
      });
    }
  });
}
function _mogr(argsArr, imagePath, res, mime, cache) {

  function autoOrient() {
    mogr.autoOrient(imagePath, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    })
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
    mogr.blur(imagePath, radius, sigma, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }

  function strip() {
    mogr.strip(imagePath, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }
  //None|Line|Plane|Partition
  function interlace(type) {
    var _temp = '0123';
    if (_temp.indexOf(type) === -1) {
      tools.endReq({
        msg: 'wrong args'
      }, res);
      return;
    }
    type = parseInt(type, 10);
    type = type;
    var map = {
      0: 'None',
      1: 'Line',
      2: 'Plane',
      3: 'Partition'
    }
    type = map[type] || 'None';
    mogr.interlace(imagePath, type, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
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
    mogr.quality(imagePath, v, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }

  function format(type) {
    if (cache.imageType.indexOf(type) === -1) {
      tools.endReq({
        msg: 'invalid type, support: ' + cache.imageType
      }, res);
    } else {
      mogr.format(imagePath, type, function(err, buf) {
        tools.pipeStream(buf, res, mime, cache);
      });
    }

  }

  function rotate(deg) {
    deg = deg || 0;
    if (isNaN(deg)) {
      tools.endReq({msg: 'invalid type'}, res);
      return;
    }
    mogr.rotate(imagePath, deg, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }

  function crop(arg) {
    //200x200-10a10
    var _tempArr = arg.split('-');
    var _xy = _tempArr[0].split('x');
    var _wh = _tempArr[1].split('a');
    var x = parseInt(_xy[0], 10);
    var y = parseInt(_xy[1], 10);
    var w = parseInt(_wh[0], 10);
    var h = parseInt(_wh[1], 10);
    if(isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      tools.endReq({msg: 'invalid type'}, res);
      return;
    }
    mogr.crop(imagePath, w, h, x, y, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
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
    case 'rotate':
      rotate(argsArr[1]);
      break;
    case 'crop':
      crop(argsArr[1]);
      break;
    default:
      tools.endReq({msg: 'illegal interface', code: 9}, res);
      return;
  }
}
