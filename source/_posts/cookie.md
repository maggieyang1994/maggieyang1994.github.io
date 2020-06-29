---
title: HTTP Cookie
date: 2020-06-28
categories: 
- 计算机网络
rank: 3
tags: 
  - cookie
  
---

### Cookie是什么？
Cookie是服务器发送到浏览器并保存到本地的一块数据， 他会随下次向同一个服务器发送请求的时候被携带并发

送到服务器上， 服务器用来判断这两个请求是否来自同一个浏览器， 一般用于保存用户的登陆态。Cookie使无状

态的HTTP协议记录信息成为了可能， 大小为4kb。

### Cookie的几个属性
服务器设置setCookie响应头，`res.setHeader("Set-Cookie", "userName= maggie")`

1. Expires 和 Max-Age

    设置Cookie的过期时间,Expires是最长有效时间（UTC时间）, Max-Age是Cookie失效之前的秒数， 优先级比
    
    expires要高, 如果这两个属性都没有， 则代表这是一个会话期Cookie, 浏览器关闭之后就会删除.

2. HttpOnly 和 Secure

    HttpOnly设置不能通过JS(`document.cookie`)拿到Cookie, 可以有效防止跨站脚本攻击

    Secure只有当请求为HTTPS的时候才会被发送到服务器, http无法使用Secure标记.

3. Domain 和 Path

    这两个属性定义了cookie被种到哪里去，domain指定了域名，如果在根域下设置， 那么其子域也会携带，反
    
    过来不成立， 如果domain 不能涵盖当前服务器的域名, 则设置不成功，毕竟百度不能给淘宝种cookie.

    path指定了路径，如果path是/, 那么/a也会携带，反过来不成立.
4. SameSite

    设置cookie不随跨站请求（跨站和跨域不一样, 跨域不一定跨站， 跨站一定跨域）一起发送， 适当的防止
    
    csrf(跨站请求伪造)，假设我已经登陆了支付宝，这时候我点了个链接，这个链接向支付宝发起了一个扣款请
    
    求， 当SameSite是None的时候，会随着这次请求将cookie带过去，支付宝认为我已经登陆，我的钱就没了。
    
    。chrome 56版本之前默认值是None, 之后改成Lax.
    
    axios默认设置跨域请求不携带cookie，如果想要携带cookie则要客户端设置`withCredential = true`,服务端
    
    设置`Access-Control-Allow-Origin`不能为*， 并且设置`Access-Control-Allow-Credentials: true`。

    如果SameSite = lax/strict 即使设置了也不会带cookie, 除非再手动将SameSite置为None.将SameSite设置成None的时候必须同时设置Secure, 否则无效。