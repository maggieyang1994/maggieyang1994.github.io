---
title: Microsoft Graph 简介以及使用
date: 2019-12-17
categories: 
- WEB前端
rank: 4
tags: 
 - outlook api
 - oAuth 2.0

---


## 简介
[Micosoft Graph](https://docs.microsoft.com/zh-cn/graph/auth-v2-service?view=graph-rest-1.0) 是微软所有服务的统一api, 比如outlook, calendar, oneNote, oneDrive等等, 将微软的所有api都整合到具有单一身份验证的的单一URI命名空间中, 提供更加简单的开发体验。

Microsoft Graph是一套RESTful的接口, 通过标准的http方法访问到, 而且还提供通过改变url参数来实现过滤, 排序分页等, 支持多语言.

  

## 关于鉴权

所有的服务请求在调用之前都必须要取得合法的授权, Micosoft Graph将Azure AD作为服务的提供方, 基于oAuth 2.0
有两种方式可以获得token
###  - 代表用户
 ####  1. 首先需要在[Azure Portal](https://portal.azure.com/)中注册一个应用
 填写应用基本信息, 应用名称和类型, 这里类型选第三种(支持的账户类型最多), Redirect URL 可以先随便填写, 但是要跟代码中的url保持一致, 注册了app之后, 会自动生成一个**client_id**<br/>
 {% path  MicrosoftGraph/2.png %}
<br/>
<br/>
 {% path  MicrosoftGraph/haa.png %}


配置应用权限, 这里我选的是email, 以及user.read 并且权限类型应该是**Delegated**委派
 {% path  MicrosoftGraph/4.png %}



配置**Client_secret**, 将secret保存, 因为你只能看到一次
 {% path  MicrosoftGraph/5.png %}


#### 2. 获取授权码（authrization_code）

打开链接[https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=](https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=)**${client_id}**&response_type=code&redirect_uri=[http://localhost:3000/auth/callback&response_mode=query&scope=offline_access%20user.read%20mail.read&state=12345](http://localhost:3000/auth/callback&response_mode=query&scope=offline_access%20user.read%20mail.read&state=12345) <br/>
**client_id**为你app注册成功后生成的client_id, **redirect_uri** 为注册app是自己填写的url<br/>
在浏览器打开, 会跳到登陆授权页面, 通过授权之后会跳到redirect_uri, 并且在url参数后面加上**authrization_code**, 由于我的应用是一个脚本, 不需要跟用户有交互, 直接复制地址栏后面的authrization_code就可以了
 {% path  MicrosoftGraph/auth.png %}
#### 4. 获取访问令牌(access_token)
```
  axios({
    url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      code,  // 上一步获得的authrization_code
      redirect_uri: 'http://localhost:3000/auth/callback',
      grant_type: `authorization_code`,
      client_id: `...`,
      scope: `user.read mail.read`,
      client_secret: '...',
    })
  })
```
返回的结果, 会得到一个access_token, 有效期是一个小时, 过期后可以通过refresh_token刷新token
```
{
    "token_type": "Bearer",
    "scope": "User.Read Mail.Read",
    "expires_in": 3600,
    "ext_expires_in": 3600,
    "access_token": "...",
    "refresh_token": "..."
}
```
#### 5. 使用token调用Microsoft Graph
通过API拿到用户信息, 必须带上Authorization的请求头
```
 axios({
    url: `https://graph.microsoft.com/v1.0/users`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  })  
```
#### 6. 使用refresh_code 刷新access_code, 以便可以持续访问
会返回一个刷新后的access_token 和 refresh_token, 如果refresh_token没有使用过, 则永远不过期
代表用户只需要授权一次, 通过不断refresh, 可以持续获取授权
```
axios({
    url: `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`,
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      refresh_token,
      redirect_uri: 'http://localhost:3000/auth/callback',
      grant_type: `refresh_token`,
      client_id: `...`,
      scope: `user.read mail.read`,
      client_secret: '...',
    })
  })
```
###  - 无用户访问
无用户访问与代表用户访问流程相似, 不同点在于注册的app Request API Permission 的时候需要选择 **Application permission** 而不是 **Delegated permission**, 且申请的权限大都需要管理员同意[一般用户企业用户], 这里不展开讨论。


