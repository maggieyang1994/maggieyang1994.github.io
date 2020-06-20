---

title: leetcode题解之二叉树
date: 2020-06-07
categories: 
- leetcode
rank: 6

---
![avatar](https://img-blog.csdnimg.cn/20190517103200752.png)
### 将108将有序数组转换为二叉搜索树
#### 题目描述
  将一个按照升序排列的有序数组，转换为一棵高度平衡二叉搜索树。
  本题中，一个高度平衡二叉树是指一个二叉树每个节点 的左右两个子树的高度差的绝对值不超过 1
#### 概念: 什么是二叉搜索树？
 二叉搜索树（Binary Search Tree）是指一棵空树或具有如下性质的二叉树：

  若任意节点的左子树不空，则左子树上所有节点的值均小于它的根节点的值
  若任意节点的右子树不空，则右子树上所有节点的值均大于它的根节点的值
  任意节点的左、右子树也分别为二叉搜索树
  没有键值相等的节点
  基于以上性质，我们可以得出一个二叉搜索树的特性：**二叉搜索树的中序遍历结果为递增序列**
``` javascript
var arr = [-10, -3, 0, 5, 9]
const again = (arr) => {
  if (!arr.length) return null;
  else {
    // 中间值不能取
    let mid = Math.floor(arr.length / 2)
    return {
      val: arr[mid],
      left: again(arr.slice(0, mid)),
      right: again(arr.slice(mid + 1, arr.length))
    }
  }
}
```