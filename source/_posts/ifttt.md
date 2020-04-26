---

title: IFTTT 入门
categories: 
- web前端
rank: 6
---
### 背景

#####  由于公司短信提供商服务不稳定, 多次发送邮件失败, 客户接收不到取件的短信, 为了监控短信服务是否正常, 需要做一个<br/>SMS Health Check

1. 每小时给测试机上发送一条sms

2. 将sms转发成Email 发送到固定邮箱

3. 十五分钟之后 通过Microsoft Graph 的接口 查看是否收到邮件

4. 收到则为正常 收不到则发送报警邮件

  



###  关于IFTTT
sms转发email的app有很多, 但是大多数只支持Andriod, [IFTTT](https://ifttt.com/)支持Andriod和iPhone, 且与其他的app相比IFTTT更加灵活, IFTTT是英文 If This Then That 的缩写, 顾名思义, 你可以在IFTTT上设定一个条件, 让系统为你做出特定的动作, 如果触发了一件事, 则执行设定好的另一件事。
![](/images/IFTTT/iftttDesc.png)
一个IFTTT称之为recipes, recipes的任务是打通[**this**]  [**that**]两个服务, this为触发器频道, that 为动作器频道。如果收到了来自特定号码的短信, 则转发邮件到特定邮箱, 收短信即为触发器, 发邮件为动作器 。


点击头像 Create按钮
&darr; <br/>
点击 **+** 添加触发器 选择你需要的服务, 这里是SMS, 目前SMS只支持Andriod, 点击Create trigger
&darr; <br/>
点击Then 后面的加号添加动作器, 同样选择你需要的服务, 点击Create action
![](/images/IFTTT/step.png)

最后会生成一个recipes
![](/images/IFTTT/res.png)
目前 IFTTT 所支持的「频道」非常丰富, 常用的如印象笔记、Dropbox、邮件、手机短信、Gmail、Google Drive、谷歌日历、Instagram、GitHub、OneDrive、Twitter、Facebook、天气预报等等。它们之中大多数既可以当触发器, 也能作为动作来使用的, 你可以在这里看到所有支持的频道。
![](/images/IFTTT/iftttService.png)
  

除了自己配置一个recipes之外, IFTTT已经有了很多已经配置好的recipes, 基本都能满足需求
![](/images/IFTTT/iftttRecipes.png)
你可以使用IFTTT 配置很多有意思的服务, 比如说

-  在豆瓣上点赞了一边文章 保存到印象笔记

- 如果下雨 发送短信提醒带伞

- 发一条微博 同步到facebook 和 twitter

- 关注的idol发推了 提醒你去看

- facebook 点赞了一张图片 自动保存
- ................

  
