---
title: oAuth2.0四种验证方式的实际应用
date: 2020-04-15
categories: 
- WEB前端
rank: 3
tags: 
  - oAuth2.0
  - shopify
  - 
  - 
---
 
### 背景： 
在实际工作中， 项目经常需要访问用户其他应用的资源，这里给项目中遇到的几种验证方式做个总结。
### 概念： oAuth2.0是什么？
oauth就是一种授权机制，第三方应用申请一个令牌来访问或者修改用户资源，用户告诉系统，同意第三方应用获取数据，系统就会生成一个短期的令牌代替密码提供给第三方使用

#### 应用登记
在授权开始之前， 需要到对应的标识平台去申请应用， 获取**client_id**和**client_secret**,以及填写用户登陆成功之后跳转的**redirect-uri**, 以microsoft举例， 对应的标志平台是[Azure](https://portal.azure.com/), 注册应用之后会生成相关的client_id和client_secret


### oAuth2.0的四种方式
- 授权码
- 密码式
- 客户端凭证
- 隐藏式

#### 第一种： 授权码
[仓库地址](https://github.com/maggieyang1994/oAuth2.0)
授权码方式是目前应用的最广泛也是最安全的方式， 主要流程就是
	1. 构造一个链接
	2. 用户点击登陆授权，生成一个授权码，将授权码以url参数带到指定的redirect-url
	3.  后端监听回调url, 通过授权码再获取令牌
	
适用户于有后端的web应用， 以Microsoft api为例
```javascript
// 构造一个链接
const  microsoft_client_id = 'c6d9df0f-f6d8-47eff8-9a68-37ca5dbe8b54';
const  microsoft_authorize_uri = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const  microsoft_redirect_uri = 'http://localhost:8080/oauth/microsoft/redirect';
link = `${microsoft_authorize_uri}?client_id=${microsoft_client_id}&response_type=code&redirect_uri=${microsoft_redirect_uri}&scope=offline_access%20user.read%20mail.read`;
```
其中`respense_type = code`表示要求返回授权码,client_id是注册应用时的id, `redirect_uri`是用户登陆成功后跳的路由, `scope` 指想要获取的权限范围
用户通过授权并登陆之后

后端代码
```javascript
// 监听redirect-url
app.use(route.get('/oauth/microsoft/redirect', async ctx => {
	// 获取到授权码  通过授权码获取令牌
	const  requestToken = ctx.request.query.code;
	const  tokenResponse = await  axios({
		url:  `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
		method:  'POST',
		headers: { 'content-type':  'application/x-www-form-urlencoded' },
		data:  qs.stringify({
			code:  requestToken,
			redirect_uri:  'http://localhost:8080/oauth/microsoft/redirect',
			grant_type:  `authorization_code`,
			client_id:  `c6d9df0f-f6d8-47e8-9adfdfd68-37ca5dbe8b54`,
			scope:  `user.read mail.read`,
			client_secret:  'WlN:FT3mH6xefdfdfMmx_LN2tRbwA4YIx-[u-',
		})
	})
})
```
其中 `code`是拿到的授权码， `grant_type: authorization_code`表示当前授权方式是授权码,  `redirect_uri`是令牌颁发后的回调地址
最终会返回令牌和刷新令牌, 令牌一般是会有有效期的， refresh_token 可以维持token持续使用

```javascript
{    
  "access_token":"ACCESS_TOKEN",
  "expires_in":2592000,
  "refresh_token":"REFRESH_TOKEN",
  "scope":"read",
  "uid":100101
}

```
#### 第二种： 密码式
如果高度信任某个应用， 也可以直接把用户名和密码直接告诉应用，直接使用 用户名和密码来申请资源， 以**shopify**举例
```javascript
let  auth = {
	username:  'e31dcb52ddfdd1025cafdd0a4ef7fff866b86aa4',
	password:  '00e3cd87c1d6db8fcdffdfd3051a286407bbf4'
}
// 拿到shopify商店 的所有产品信息
const  getDataFromShopify = () => {
	let  url = "https://maggieteststore1.myshopify.com/admin/api/2019-10/products.json"
	return  axios({
		method:  'get',
		url,
		auth,
	})
}
```
#### 第三种： 凭证式
适用于没有前端的后台应用， 不需要跟用户有交互，代表第三方应用而不是代表用户, 以**百度OCR**图片转文字为例
```javascript
let  url = "https://aip.baidubce.com/oauth/2.0/token";
let  grant_type = "client_credentials";
let  client_id = "oAuOqOhDddyqiiSwTc4XiY0ZhI";
let  client_secret = "A8IvA6dfdfddKhI2he9GuG8wxfvgRmFZL33UZq";
axios.get(url, {
	params: {
		grant_type,
		client_id,
		client_secret
	}
})
```
其中`grant_type=client_credentials`表示授权采用凭证式，`client_id`和`client_secret`用户验证身份

#### 第四种： 隐藏式
适用于纯前端应用， 没有后端，实际项目中没有应用， 后面再来补充
1. a网站提供一个链接， 调到b网站， 授权用户数据给a
```javascript
var url = https://b.com/oauth/authorize?
  response_type=token&
  client_id=CLIENT_ID&
  redirect_uri=CALLBACK_URL&
  scope=read
```
其中`response_type = token`代表不需要授权码，直接返回令牌
 2. 用户跳转到b网站， 登录后跳回到b网站， 同时将令牌作为url参数传给a网站， 前端页面直接通过url参数取
