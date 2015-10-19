var gm = require('gm');
var tools = require('./lib');

module.exports = function(argsArr, imagePath, res, mime, cache) {
  function mode1(w, h) {
    //等比缩放, 不裁剪
    gm(imagePath).size(function(err, size) {
      var originW = size.width;
      var originH = size.height;
      if (w && h) {
        if (w < originW || h < originH) {
          if (w / h > originW / originH) {
            w = (originW * h / originH).toFixed(1);
            this.resize(w, h)
              .stream(function(err, stdout) {
                tools.pipeStream(stdout, res, mime, cache);
              });
          } else {
            h = (w * originH / originW).toFixed(1);
            this.resize(w, h)
              .stream(function(err, stdout) {
                tools.pipeStream(stdout, res, mime, cache);
              });
          }
        } else {
          this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime);
          });
        }
      } else if (w || h) {
        var temp = w || h;
        if (temp > originW || temp > originH) {
          return this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
        }

        h = h || (temp * originH / originW).toFixed(1);
        w = w || (originW * temp / originH).toFixed(1);
        this.resize(w, h)
          .stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
      }
    });
  }

  function mode2(w, h) {
    //等比缩放, 裁剪
    gm(imagePath).size(function(err, size) {
      var originW = size.width;
      var originH = size.height;
      if (w && h) {
        if (w > originW && h > originH) {
          this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
        } else {
          if (w <= originW && h >= originH) {
            h = originH
          } else if (w > originW && h < originH) {
            w = originW
          }
          // this.out('-thumbnail', w + "x" + h + "^")
          this.resize(w, h, "^")
            .gravity("Center")
            .extent(w, h)
            .stream(function(err, stdout) {
              tools.pipeStream(stdout, res, mime, cache);
            });
        }
      } else {
        var temp = w || h;
        this.resize(temp, temp, "^")
          .gravity("Center")
          .extent(temp, temp)
          .stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
      }
    });
  }

  function mode3(w, h) {
    mode1(w, h);
  }

  function mode4(w, h) {
    gm(imagePath).size(function(err, size) {
      var originW = size.width;
      var originH = size.height;
      if (w && h) {
        if (w > originW && h > originH) {
          this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime);
          });
        } else {
          if (w / h > originW / originH) {
            h = (w * originH / originW).toFixed(1);
          } else {
            w = (h * originW / originH).toFixed(1);
          }
          this.resize(w, h)
            .stream(function(err, stdout) {
              tools.pipeStream(stdout, res, mime, cache);
            });
        }
      } else {
        var temp = w || h;
        if (temp > originW || temp > originH) {
          return this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
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
            tools.pipeStream(stdout, res, mime, cache);
          });
      }
    });
  }

  function mode5(w, h) {
    gm(imagePath).size(function(err, size) {
      var longEdje, shortEdje;
      if (size.width > size.height) {
        longEdje = size.width;
        shortEdje = size.height;
      } else {
        shortEdje = size.width;
        longEdje = size.height;
      }
      if (w && h) {
        if (w / h > longEdje / shortEdje) {
          h = (w * shortEdje / longEdje).toFixed(1);
        } else {
          w = (longEdje * h / shortEdje).toFixed(1);
        }
        this.resize(w, h)
          .stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
      } else {
        var temp = w || h;
        if (temp > longEdje) {
          return this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
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
            tools.pipeStream(stdout, res, mime, cache);
          });
      }
    });
  }

  function mode6(w, h) {
    gm(imagePath).size(function(err, size) {
      var longEdje, shortEdje;
      if (size.width > size.height) {
        longEdje = size.width;
        shortEdje = size.height;
      } else {
        shortEdje = size.width;
        longEdje = size.height;
      }
      if (w && h) {
        if (w > longEdje && h > shortEdje) {
          this.resize(w, h)
            .stream(function(err, stdout) {
              tools.pipeStream(stdout, res, mime, cache);
            });
        } else {
          this.resize(w, h, "^")
            .gravity('Center')
            .extent(w, h)
            .stream(function(err, stdout) {
              tools.pipeStream(stdout, res, mime, cache);
            });
        }
      } else {
        var temp = w || h;
        if (temp > longEdje) {
          return this.stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
        }
        this.resize(temp, temp, "^")
          .gravity('Center')
          .extent(temp, temp)
          .stream(function(err, stdout) {
            tools.pipeStream(stdout, res, mime, cache);
          });
      }
    });
  }
  var indexOfW = argsArr.indexOf('w');
  var indexOfH = argsArr.indexOf('h');
  var argsArrLen = argsArr.length;
  var mode = parseInt(argsArr[0], 10);
  var w, h;
  if (argsArrLen === 3) {
    if (indexOfW !== -1) {
      w = parseInt(argsArr[indexOfW + 1], 10);
      h = null;
      if (isNaN(w)) {
        return tools.endReq({msg: 'illegal arg w', code: 1}, res);
      }
    } else {
      h = parseInt(argsArr[indexOfH + 1], 10);
      if (isNaN(h)) {
        return tools.endReq({msg: 'illegal arg h', code: 1}, res);
      }
      w = null;
    }
  } else if (argsArrLen === 5) {
    w = parseInt(argsArr[indexOfW + 1], 10);
    h = parseInt(argsArr[indexOfH + 1], 10);
    if (isNaN(w) || isNaN(h)) {
      return tools.endReq({msg: 'illegal args', code: 1}, res);
    }
  } else {
    return tools.endReq({msg: 'illegal mode', code: 1}, res);
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
      tools.endReq({msg: 'end', code: 9}, res);
  }
}
