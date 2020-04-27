
---

title: 前端安全之XSS和CSRF
date: 2019-08-17
categories: 
- web安全
rank: 5
tags: 
  - web安全
  - 跨站脚本攻击
  - 跨站请求伪造

---

### xss攻击（跨站脚本攻击cross-site script）
##### 概念： xss是一种代码注入攻击， 由于恶意代码没有经过过滤， 与目标网站的正常代码混在一起, 浏览器过于信任来自服务器或者页面上的代码， 使得一些恶意代码在浏览器上运行
##### 分类： 根据攻击的来源，XSS可以分为存储型， 反射型，DOM型

- **反射型**（一般是后台的锅，没有处理就直接返回到页面）：当用户点击一个恶意链接，或者提交一个表单，或者进入一个恶意网站， 注入脚本进入被攻击者的网站，web服务器将注入脚本， 服务器未过滤直接返回到用户的浏览器上
  **场景**： 表单提交， 页面跳转
	 ```javascript
	  // 假设有个链接 http:localhost:5000/welcome?type=<script src="任意脚本"></script>
	  // 后台代码
	  app.get("/welcome", function(req,res){
		  res.send(req.params.type)
	  });
	  只要用户点击了链接  就会执行这个 脚本， 窃取用户的信息
	 ```
  **如何防范反射型**： 后台代码进行对查询参数进行转义后再输入页面
	 ```  javascript
	  app.get('/welcome', function(req, res){
		  //对查询参数进行编码，避免XSS攻击
		  res.send(encodeURIComponent(req.params.type))
	  })

	```

- **DOM型**（一般为前端的锅，javascript代码不够严谨，把不可信的内容插入到了页面上[innerHtml, outHtml, document.write]）
  **场景**： 页面评论追加, 论坛 贴吧
	``` javascript
		var str = "<script>alert(2)</script>"
		document.write(str); || $(".demo").html = str
	```
	 **如何防范dom型xss**
	``` javascript
	// 对输入内容进行转义
	 function  encodeHtml(str) {
			return  str.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
	}```
- **存储型XSS**: 前端和后台的锅，前端提交数据到服务器的时候没有做好过滤， 服务器在接受数据的时候， 在存储数据[恶意代码存到了数据库， 每个用户打开这个页面的时候都会执行恶意代码， 影响大]的时候没有做好过滤，前端从服务器请求到数据，没有过滤输出
	 **如何防范存储型XSS**： 前段后端都进行转义

### **总结： 如何防范xss攻击**

 1. [content Security Policy](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP):在服务器使用 content Security Policy头部来指定策略，或者在前端设置meta标签
		   -  script-src https://cdn.jsdelivr.net: 限制可以加载内容的域（可执行脚本的有效来源）
		   -  img-src https://*  限制图片的来源只允许https协议
		   -  media-src media1.com media2.com 限制音视频来源
		   -  ....限制可以通过标签加载的资源的来源 [等等等](http://www.ruanyifeng.com/blog/2016/09/csp.html)

 ``` javascript
 // 服务器
 res.Header('Content-Security-Policy', default-src 'self')
 // html页面
<meta  http-equiv="Content-Security-Policy"  content="script-src https://cdn.jsdelivr.net; img-src https://*; child-src 'none';">
 ```

 2.  输入内容长度限制
 3. 输入内容限制（禁止特殊字符）
 4. 服务端设置httpOnly禁止读取cookie


###  CSRF攻击（跨站请求伪造 cross-site requrie forgery）：
##### 概念： 用户在被攻击网站登陆之后， 诱使用户进入第三方网站， 在第三方网站中向被攻击网站发送跨站请求（form提交， src脚本， 图片地址， 链接），此时这个请求会携带被攻击网站的cookie.绕过被攻击网站的后台验证
##### 场景： 用户已经登陆了支付宝网站， 生成了cookie等相关登录凭证，然后我打开了一个钓鱼网站，这个钓鱼网站自动发起了表单提交申请扣款， 这个时候会自动把cookie带过去， 绕过了支付宝的后台验证
```html
<form  name="sneak"  action="http://localhost:3001/api/transfer"  method="post">
	<input  type="hidden"  name="payee"  value="yvette"  />
	<input  type="hidden"  name="amount"  value="2000"  />
</form>
<script>
 document.onload = function(){
 // 当你的浏览器载入这个页面之后，上面的表单将会由一个简单的 JS 片段来实现提交。
   document.sneak.submit();
 }
</script>
```
**如何防范csrf攻击攻击**

 1. 使用验证码
 2. 使用token

	CSRF攻击之所以能够成功，是因为服务器误把攻击者发送的请求当成了用户自己的请求。
	那么我们可以要求所有的用户请求都携带一个CSRF攻击者无法获取到的Token。
	服务器通过校验请求是否携带正确的Token，来把正常的请求和攻击的请求区分开。
	跟验证码类似，只是用户无感知。
	  1. 服务端生成一个token, 加密传给用户
	  2. 用户在请求时， 需要携带这个token
	  3. 服务端验证token是否正确

 4. 判断refererr，判断来源
 5. 设置samesite的cookie, 让跨域不携带cookie(ajax默认携带)，但是axios默认不携带


