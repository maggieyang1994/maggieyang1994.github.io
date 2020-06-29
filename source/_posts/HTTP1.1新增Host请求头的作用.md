---
title: HTTP1.1新增Host请求头的作用
date: 2020-06-15
categories: 
- 计算机网络
rank: 3
tags: 
  - HTTP1.1
  
---
在学习 [ HTTP的发展](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP) 的MDN文档的时候，阐述HTTP1.1新增的HOST请求头中的优点中有这样这句话存在疑问，特此记录一下。

> 感谢[`Host`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Host "Host 请求头指明了服务器的域名（对于虚拟主机来说），以及（可选的）服务器监听的TCP端口号。")头，能够使不同域名配置在同一个IP地址的服务器

{% path  HTTP/DNS.png %}
{% path  HTTP/host.jpg %}
假设有三个域名`a.fedev.me`, `b.fedev.me`, `c.fedev.me` 指向同一个IP地址, 你希望根据不同的域名返回不同的资源，有以下三种方法:

 1. 起一个服务，监听默认的80端口， 根据Host头返回不同的资源【代码耦合】

 2. 起三个服务，分别监听不同的端口，返回不同的资源【前端访问需要带端口号】

 3.  通过**Nginx**配置(配置静态目录 或者 转发)
 ``` javascript
  server {
        listen       80;
        server_name  a.fedev.me;
        root         /var/content/a;
}
server {
        listen       80;
        server_name  b.fedev.me;
        root         /var/content/b;
}
server {
        listen       80;
        server_name  c.fedev.me;
        root         /var/content/c;
}
 ``
```
 
```
server {
        listen                80;
        server_name   c.fedev.me;
        location / {
          proxy_pass     http://node:3001(node 是跑在docker中服务的名字)
        }
}
```
#### 关于[Host](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Host), [Origin](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Origin), [Referer](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referer)
Host是目标服务器的域名/IP地址 和 端口，HTTP1.1中必须携带Host头， 否则返回400(Bad Request) 

Origin是当前客户端的host【简单请求自动带上】

Referer是当前客户端的URL(host+路径信息,  一般用于图片防盗链)