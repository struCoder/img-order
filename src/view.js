module.exports = function(argsArr) {
  var argsArrLen = argsArr.length;
  var mode1 = function(w, h) {
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
      } else {
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
      } else {
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
