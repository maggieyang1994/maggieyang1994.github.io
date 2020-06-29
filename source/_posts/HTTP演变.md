---
title: HTTP 发展进程
date: 2020-06-28
categories: 
- 计算机网络
rank: 3
  
---
## HTTP是什么?
HTTP 是一种通讯协议，基于 TCP/IP 协议，属于应用层协议。 

它不涉及数据包的传输，主要规定了客户端与服务端之间的通信格式。 

HTTP 是可扩展（通过 headers）、无状态（有会话，通过 cookie 实现）。 

## HTTP版本

### HTTP/0.9
HTTP/0.9, 只有一个 GET 方法。 

TCP 连接建立之后客户端向服务端发起请求，服务端只能返回 HTML 格式的字符串无法传输其他类型的文件，响应内容没有请求头也没有状态码和错误码，

服务端数据发送完毕之后关闭 TCP 连接。

### HTTP/1.0

HTTP/1.0 在 1996 年发布，扩展了原有的 HTTP/0.9 版本协议，新增了以下主要内容： 

1. 协议版本会随着请求一起发送（HTTP/1.0 被追加到第一行末尾） 

2. 引入了 POST 命令和 HEAD 命令 

3. 引入了 HTTP 头的概念，允许传输元数据 

4. 具备了传输除纯文本 HTML 文件以外其他类型文档的能力（content-type） 

5. 其他功能还包括状态码（status code）、多字符集支持、多部分发送（multi-part type）、权限（authorization）、缓存（lastModified/if-modified-since，expires）、内容编码（content encoding）等等 

### HTTP/1.1
 
HTTP/1.1 版本于 1997 年发布，是目前最流行的版本，这个版本消除了大量歧义内容并引入了多项改进： 

1. TCP 连接复用(connection: keep-alive)
    还是有并发请求限制，为了解决并发请求限制， 可以设置域名分片，申请子域名， 将资源均匀的部署在子域名上， 雪碧图， js,css文件压缩打包， 减少请求次数.

2. 引入管道机制（pipeline）
    A可以和B请求一起发送， 但是服务器还是会按照顺序处理请求， 一旦前面有请求超时，后续请求只能被阻塞， 造成队头阻塞

3. 支持响应分块 ([HTTP请求范围](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Range_requests))

4. 引入额外的缓存控制机制
    新增了Etag, If-None-Match, max-age

5. 引入内容协商机制，包括语言，编码，类型等，并允许客户端和服务器之间约定以最合适的内容进行交换 

6. 添加 Host 头，使不同域名配置在同一个服务器上

### HTTP/2

1. 多路复用

2. 头部压缩

3. 二进制协议

4. 服务器推送（server push）
