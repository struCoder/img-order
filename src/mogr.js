'use strict';

const gm = require('gm');
const tools = require('./lib');

let mogr = module.exports = _mogr;

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
    const originW = size.width;
    const originH = size.height;
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
    const _args = argStr.split('x');
    if (_args.length !== 2) {
      return tools.endReq(res, 'args wrong');
    }
    let radius = _args[0];
    let sigma = _args[1];
    if (radius < 1 || radius > 50) {
      return tools.endReq(res, 'radius should between 1 and 50');
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
    const tmp = '0123';
    if (tmp.indexOf(type) === -1) {
      return tools.endReq(res, 'wrong args');
    }
    type = parseInt(type, 10);
    type = type;
    const map = {
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
      return tools.endReq(res, 'the value should between 1 and 100');
    }
    mogr.quality(imagePath, v, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }

  function format(type) {
    if (cache.imageType.indexOf(type) === -1) {
      tools.endReq(res, `invalid type, support:${cache.imageType}`);
    } else {
      mogr.format(imagePath, type, function(err, buf) {
        tools.pipeStream(buf, res, mime, cache);
      });
    }

  }

  function rotate(deg) {
    deg = deg || 0;
    if (isNaN(deg)) {
      tools.endReq(res, 'invalid type');
      return;
    }
    mogr.rotate(imagePath, deg, function(err, buf) {
      tools.pipeStream(buf, res, mime, cache);
    });
  }

  function crop(arg) {
    //200x200-10a10
    const _tempArr = arg.split('-');
    const _xy = _tempArr[0].split('x');
    const _wh = _tempArr[1].split('a');
    const x = parseInt(_xy[0], 10);
    const y = parseInt(_xy[1], 10);
    const w = parseInt(_wh[0], 10);
    const h = parseInt(_wh[1], 10);
    if(isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      tools.endReq(res, 'invalid type');
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
      tools.endReq(res, 'illegal interface');
      return;
  }
}
