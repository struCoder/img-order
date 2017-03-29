English([中文](./README_CN.md))
--------

[![Join the chat at https://gitter.im/imgorder/Lobby](https://badges.gitter.im/imgorder/Lobby.svg)](https://gitter.im/imgorder/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Introduction
---------
Customize image to your needs

Getting started
--------
First, we should download graphicsmagick

Install graphicsmagick

#### Mac OSX

```
brew install graphicsmagick
```

#### Linux
```
sudo apt-get install graphicsmagick
```

#### Windows

[window install](http://www.graphicsmagick.org/INSTALL-windows.html)



#### then either use npm
npm install img-order

Change log
------------

### 2017-03-29
-  maintaining project

### 2015-10-22
-  Export API for Developer to processed image(see example)

### 2015-10-20
- Fix image interlace bug
- Add image roate
- Add image crop

### 2015-10-19
Advanced image processing
Include

-  According to the original EXIF information automatic rotation
-  Removal of meta information in the image.
-  Gauss fuzzy parameter
-  Progressive display
-  Picture quality


### 2015-06
Basic image processing


How to use ?
----------
If you use `experss` or `koa` you just do this
```javascript
var app = require('express'); // or app = ('koa')
var imgOrder = require('img-order');

var config = {
    dest: 'absolute path to your image dir',    // must
    url: 'the client request url',              // must
    legalImg: 'jpg,jpeg,png,gif',               // option
    tempImgDir: 'cache temp images',            // option(suggest to use)
    maxAge: 2592000                             // cache-control option
}
app.use(imgOrder(config));
```

Interface specification
-----------------------

**Basic Use**

    imageView /<mode>
        /w/<Width>
        /h/<Height>


| mode  | Introduction |
| ------------- | ------------- |
| /0/w/`LongEdge`/h/`ShortEdge`  | Limit the long sides of the thumbnail for a maximum of `LongEdge`, short edge up to `ShortEdge`, carries on the geometric scaling, not cut. If only specify `w` parameters is limited long (short) and adaptive, specify only `h` parameter indicates limited short side (long edge adaptive).  |
| /1/w/`Width`/h/`Height`  | Qualified thumbnail wide at least for ` Width `, high minimum of `Height`, carries on the geometric scaling, center cut. After turning the thumbnail usually happens to be  `Width` x ` Height ` size (one side when zooming by beyond rectangular box was cut off excess part). If you only specify w parameters or only specified h, on behalf of the limited to tetragonal figure is as broad as it is  |
| /2/w/`Width`/h/`Height`  | Limit the thumbnail Width up to `Width`, high up to `Height`, carries on the geometric scaling, not cut. If only specify w parameter represents finite width (adaptive), specify only h parameter finite long (wide adaptive). It similar to mode 0, the difference between just limit width and height, not qualified long side and short side.  |
| /3/w/`Width`/h/`Height`  | Qualified thumbnail wide at least for `Width`, high minimum of `Height`, carries on the geometric scaling, not cut. If only specify w parameters or only specified h, on behalf of the width is limited to the same value  |
| /4/w/`LongEdge`/h/`ShortEdge`  | CLimit the long sides of the thumbnail for at least the `LongEdge`, short edge at least for `ShortEdge`, carries on the geometric scaling, not cut. If you only specify w parameters or only specified h, said long should be the same value in a short while  |
| /5/w/`LongEdge`/h/`ShortEdge`  | Limit the long sides of the thumbnail for at least the `LongEdge`, short edge at least for `ShortEdge`, carries on the geometric scaling, center cut. If you only specify w parameters or only specified h, said long should be the same value in a short while.  |



**Advance use**


    imagemogr /autoorient
        /strip
        /blur/<radius>x<sigma>
        /format/<Format>
        /quality/<v>
        /crop/<width>x<height>-<x>a<y>
        /rotate/<deg>
        /interlace/<num>


| mode  | Introduction |
| ------------- | ------------- |
| /autoorient  | according to the original EXIF information automatic rotation  |
| /strip  | removal of meta information in the image.  |
| /blur  | Gauss fuzzy parameters, <radius> is the fuzzy radius, the range is 1-50. <sigma> is the standard deviation of normal distribution, and must be greater than 0. When the image format is GIF, the parameter is not supported.  |
| /quality/`v`  | Picture quality, the range is 1-100. Default 85  |
| /format/`format`  | The output of the new format  |
| /crop/`width`x`height`-`x`a`y` | cut image to you need, width is cut width, height is cut height, x and y is origin image coordinate |
| /rotate/`deg` | rotate image |
| /interlace/`num` | num: 0 or 1 or 2 or 3 means None or Line or Plane or Partition |

example
---------

###use as nodejs middleware

```javascript
...

var imgOrder = require('img-order');
var config = {
  dest: 'C:/Users/david/Pictures/lovewallpaper/',
  url: 'customizeImg',
  tempImgDir: 'C:/Users/david/Pictures/temp'
}
app.use(imgOrder(config));

/*
//basic use
1.customize Image:
 localhost:3100/customizeImg/zz.png?imageView/0/h/500
 and so on...

// advance use
2. advance use
 localhost:3100/customizeImg/zz.jpg?imagemogr/format/png
 localhost:3100/customizeImg/zz.jpg?imagemogr/blur/3x9
 localhost:3100/customizeImg/zz.jpg?imagemogr/quality/50
 ad so on...
*/
...
```

### use processed image api
```javascript
var imgOrder = require('img-order');
var view = imgOrder.view;
var mogr = imgOrder.mogr;
var fs = require('fs');

view.mode1('absolute/path/to/you/image', 200, null, function(err, stream) {
  var write = fs.createWriteStream('test.jpg');
  stream.pipe(write)    //or stream.pipe(res).  ups to your need
});

mogr.format('absolute/path/to/you/image', 'png', function(err, stream) {
  var write = fs.createWriteStream('test.jpg');
  stream.pipe(write)    //or stream.pipe(res).  ups to your need
});

//And so on...
```

### API LIST
__Basic Use Api__

// see Interface specification mode0

view.mode1('absulote imagePath', width, height, callback)

// see Interface specification mode1

view.mode2('absulote imagePath',width, height, callback);

// see Interface specification mode2

view.mode3('absulote imagePath', width, height, callback);

// see Interface specification mode3

view.mode4('absulote imagePath', widht, height, callback);

// see Interface specification mode4

view.mode5('absulote imagePath', widht, height, callback);

// see Interface specification mode5

view.mode6('absulote imagePath', widht, height, callback);

callback:
>  function(err, stream) {}


__Advance Use Api__
mogr.format('absulote imagePath', formatType(string), callback);

mogr.rotate('absulote imagePath', deg(int | string), callback);

mogr.crop('absulote imagePath', width, height, x, y, callback);

mogr.quality('absulote imagePath', v(int), callback);

mogr.interlace('absulote imagePath', ('Node | Line | Plane | Partition'), callback);

mogr.strip('absulote imagePath', callback);

mogr.blur('absulote imagePath', callback);

mogr.autoOrient('absulote imagePath', callback);


callback:
>  function(err, stream) {}


I Love This. How do I Help?
---------------------------
- Simply star this repository :-)
- Contribute Code! We're developers!

Todo
-------
- [x]  thumbnail image
- [x]  image cut
- [x]  format image
- [x]  rotate image
- [x]  progressive display
- [ ]  watermark
- [ ]  EXIF(EXchangeable Image File Format)

License
-------
MIT

