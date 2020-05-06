hexo.extend.tag.register('path', function(args, content){
  // 有时不能实时相应更改
  let basicUrl = 'https://blog-1302010797.cos.ap-guangzhou.myqcloud.com'
  return `<img src = "${basicUrl}/${args[0]}" />`
});