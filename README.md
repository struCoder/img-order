English
--------
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
        /format/<Format>


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


| mode  | Introduction |
| ------------- | ------------- |
| /autoorient  | according to the original EXIF information automatic rotation  |
| /strip  | removal of meta information in the image.  |
| /blur  | Gauss fuzzy parameters, <radius> is the fuzzy radius, the range is 1-50. <sigma> is the standard deviation of normal distribution, and must be greater than 0. When the image format is GIF, the parameter is not supported.  |
| /quality/`v`  | Picture quality, the range is 1-100. Default 85  |
| /format/`format`  | The output of the new format  |



example
---------
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
2. format
 localhost:3100/customizeImg/zz.jpg?imagemogr/format/png
 localhost:3100/customizeImg/zz.jpg?imagemogr/blur/3x9
 localhost:3100/customizeImg/zz.jpg?imagemogr/quality/50
 ad so on...
*/
...
```


Todo
-------
- [x]  thumbnail image
- [x]  image cut
- [x]  format image
- [ ]  rotate image
- [ ]  progressive display
- [ ]  watermark
- [ ]  EXIF(EXchangeable Image File Format)




中文
---------------

介绍
----
根据需求定制自己需要的图片

准备开始
--------
首先我们需要下载graphicsmagick

安装graphicsmagick

#### Mac OSX

```
brew install graphicsmagick
```

#### Linux
```
sudo apt-get install graphicsmagick
```

#### Windows

[install exe](http://www.graphicsmagick.org/INSTALL-windows.html)



#### 之后使用npm安装
npm install img-order


修改纪录
------------
### 2015-10-19
图片高级处理
包括
-  根据原图EXIF信息自动旋正
-  去除图片中的元信息。
-  高斯模糊参数，<radius>是模糊半径，取值范围为1-50。<sigma>是正态分布的标准差，必须大于0。图片格式为gif时，不支持该参数。
-  是否支持渐进显示，取值1 支持渐进显示，取值0不支持渐进显示（缺省为0）
-  图片质量，取值范围为1-100。默认85


### 2015-06
Basic image processing


如何使用 ?
----------
If you use `experss` or `koa` you just do this
```javascript
var app = require('express'); // or app = ('koa')
var imgOrder = require('img-order');

var config = {
    dest: 'absolute path to your image dir',    // 必须
    url: 'the client request url',              // 必须
    legalImg: 'jpg,jpeg,png,gif',               // 可选
    tempImgDir: 'cache temp images',            // 可选(推荐使用)
    maxAge: 2592000                             // 可选 cache-control
}
app.use(imgOrder(config));
```

接口规范
-----------------------

    imageView /<mode>
        /w/<Width>
        /h/<Height>
        /format/<Format>


| 模式  | 介绍 |
| ------------- | ------------- |
| /0/w/`LongEdge`/h/`ShortEdge`  | 限定缩略图的长边最多为<LongEdge>，短边最多为`ShortEdge`，进行等比缩放，不裁剪。如果只指定 `w` 参数则表示限定长边（短边自适应），只指定 h 参数则表示限定短边（长边自适应）  |
| /1/w/`Width`/h/`Height`  | 限定缩略图的宽最少为<Width>，高最少为`Height`，进行等比缩放，居中裁剪。转后的缩略图通常恰好是 `Width`x`Height` 的大小（有一个边缩放的时候会因为超出矩形框而被裁剪掉多余部分）。如果只指定 `w` 参数或只指定 `h` 参数，代表限定为长宽相等的正方图。  |
| /2/w/`Width`/h/`Height`  | 限定缩略图的宽最多为`Width`，高最多为`Height`，进行等比缩放，不裁剪。如果只指定 `w` 参数则表示限定宽（长自适应），只指定 `h`  |
| /3/w/`Width`/h/`Height`  | 限定缩略图的宽最少为`Width`，高最少为`Height`，进行等比缩放，不裁剪。如果只指定`w` 参数或只指定`h`. 参数，代表长宽限定为同样的值  |
| /4/w/`LongEdge`/h/`ShortEdge`  | 限定缩略图的长边最少为`LongEdge`，短边最少为`ShortEdge`，进行等比缩放，不裁剪。如果只指定`w` 参数或只指定 `h` 参数，表示长边短边限定为同样的值  |
| /5/w/`LongEdge`/h/`ShortEdge`  | 限定缩略图的长边最少为`LongEdge`，短边最少为`ShortEdge`，进行等比缩放，居中裁剪。如果只指定`w` 参数或只指定`h`. 参数，表示长边短边限定为同样的值  |




**高级使用**


    imagemogr /autoorient
        /strip
        /blur/<radius>x<sigma>
        /format/<Format>
        /quality/<v>


| mode  | Introduction |
| ------------- | ------------- |
| /autoorient  | 根据原图EXIF信息自动旋正  |
| /strip  | removal of meta information in the image.  |
| /blur  | 高斯模糊参数，<radius>是模糊半径，取值范围为1-50。<sigma>是正态分布的标准差，必须大于0。图片格式为gif时，不支持该参数。  |
| /quality/`v`  | 图片质量，取值范围为1-100。默认85  |
| /format/`format`  | 图片格式化输出  |




示例
---------
```javascript
...
var imgOrder = require('img-order');
var config = {
  dest: 'C:/Users/david/Pictures/lovewallpaper/',
  url: 'customizeImg',
  tempImgDir: 'C:/Users/david/Pictures/temp'
}
app.use(imgOrder(config));
...

/*

// 基本使用
1.定制图片:
 localhost:3100/customizeImg/zz.png?imageView/0/h/500
 and so on...

//高级使用
2. 不同格式输出
 localhost:3100/customizeImg/zz.png?/format/jpg
 localhost:3100/customizeImg/zz.jpg?imagemogr/format/png
 localhost:3100/customizeImg/zz.jpg?imagemogr/blur/3x9
 localhost:3100/customizeImg/zz.jpg?imagemogr/quality/50
 ad so on...
*/
```

需要完成的任务
-------
- [x]  图片的缩略
- [x]  图片裁剪
- [x]  不同格式图片输出
- [ ]  旋转图片
- [ ]  图片的渐进显示
- [ ]  水印
- [ ]  EXIF(EXchangeable Image File Format)


License
-------
MIT

