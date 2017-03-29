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
### 2017-03-29
-  项目维护

### 2015-10-22
-  为开发者提供接口

### 2015-10-20
-  修复图片渐进显示的bug
-  添加图片旋转
-  添加图片的指定位置裁剪

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

###  作为Nodejs中间件
如果你使用`express`或者`koa`
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

// 基本使用
1.定制图片:
 localhost:3100/customizeImg/zz.png?imageView/0/h/500
 and so on...

//高级使用
2. 高级使用
 localhost:3100/customizeImg/zz.png?/format/jpg
 localhost:3100/customizeImg/zz.jpg?imagemogr/format/png
 localhost:3100/customizeImg/zz.jpg?imagemogr/blur/3x9
 localhost:3100/customizeImg/zz.jpg?imagemogr/quality/50
 ad so on...
```



###  使用开发接口
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
        /crop/<width>x<height>-<x>a<y>
        /rotate/<deg>
        /interlace/<num>

| mode  | Introduction |
| ------------- | ------------- |
| /autoorient  | 根据原图EXIF信息自动旋正  |
| /strip  | removal of meta information in the image.  |
| /blur  | 高斯模糊参数，<radius>是模糊半径，取值范围为1-50。<sigma>是正态分布的标准差，必须大于0。图片格式为gif时，不支持该参数。  |
| /quality/`v`  | 图片质量，取值范围为1-100。默认85  |
| /format/`format`  | 图片格式化输出  |
| /crop/`width`x`height`-`x`a`y` | 裁减你需要的图片, width, height为裁剪后的图片宽度和高度, x,y 为原始图片的裁剪坐标 |
| /interlace/`num` | num的取值范围为[0,3], 意思分别为不渐进, 线性渐进, 单位面渐进, 分裂渐进 |


```
### API LIST
__基础图片处理接口__

// 见接口规范中的 mode0
view.mode1('absulote imagePath', width, height, callback)

// 见接口规范中的 mode1
view.mode2('absulote imagePath',width, height, callback);

// 见接口规范中的 mode2
view.mode3('absulote imagePath', width, height, callback);

// 见接口规范中的 mode3
view.mode4('absulote imagePath', widht, height, callback);

// 见接口规范中的 mode4
view.mode5('absulote imagePath', widht, height, callback);

// 见接口规范中的 mode5
view.mode6('absulote imagePath', widht, height, callback);

callback:
>  function(err, stream) {}


__高级图片处理接口__
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


需要完成的任务
-------
- [x]  图片的缩略
- [x]  图片裁剪
- [x]  不同格式图片输出
- [x]  旋转图片
- [x]  图片的渐进显示
- [ ]  水印
- [ ]  EXIF(EXchangeable Image File Format)

