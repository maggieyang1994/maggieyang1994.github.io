---

title: hexo配置图片baseURL
date: 2020-05-02
categories: 
- WEB前端
rank: 7
tags: 
  - hexo
  - markdown

---
由于博客页面托管于github,  加载图片的时候会很慢, 图片压缩之后效果仍然不明显, 于是将图片托管于腾讯云对象存储.那么就需要一个一个的更改图片, 假设以后图片的域名发生了改变, 又需要逐个更改, 增加了很多不必要的劳动. 于是配置图片basicURL, 一处定义, 多处使用.


markdown插入图片有两种方式:
1. `![](图片地址)`
2. `<img src="图片地址"></img>`

其中第一种插入方式在以下方法中不适用

以下是根据第二种方式设置图片公共路径的方法：
1. 在根目录下创建一个scripts文件夹, 将你的脚本放置在该文件夹下, 在启动的时候会自动载入脚本
2. 添加hexo标签插件
```javascript
  //scripts/image.js
  hexo.extend.tag.register('imagePath', function(args, content){
    let basicUrl = 'https://blog-1302010797.cos.ap-guangzhou.myqcloud.com'
    return `<img src = "${basicUrl}/${args[0]}" />`
  });
```
相当于定义了一个全局方法, 其中imagePath是方法名, args是调用imagePath时传入的参数, 该方法返回一个拼接图片地址的img标签
3. markdown中使用
```javascript
{% imagePath  images/1.png %}
```