
---
title: diff算法
categories: 
  - VUE源码
rank: 1
tags: 
  - vue源码
  - 虚拟DOM
  - diff算法
---
### 流程图
![](/images/VUE_DIFF/流程图.png)
**触发diff算法的过程**: 派发更新`dep.notify`(observer/index.js) --> `wather.update` 将回调加入`queueWathcher`等待队列(obserber/wather.js) --> 去除重复之后等到下一个事件循环执行回调(observer/scheduler.js) ---> 执行`vm.__patch__(prevVnode, vnode)`(instance/lifecycle.js), 下面来看patch.js
#### patch源码（代码简化版本）
```javascript
return function patch (oldVnode, vnode, hydrating, removeOnly) {
    //如果vnode不存在但是oldVnode存在，说明意图是要销毁老节点，那么就调用invokeDestroyHook(oldVnode)来进行销毁
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // 如果oldVnode不存在但是vnode存在，说明意图是要创建新节点，那么就调用createElm来创建新节点
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {

      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // 如果oldVnode和vnode是同一个节点，就调用patchVnode来进行patch
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        // 只会在同层级比较 如果父节点的标签或者key不同 后面子节点就没有再比较的必要了
        // 如果oldVnode和vnode不是samenode的话 
        // 大概过程就是创建一个新节点 -> 以oldVnode.elm为参照点插入到老节点的后面 -->删除oldVnode
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }

```
##### 其中sameVnode源码
```javascript
function sameVnode (a, b) {
  return (
    a.key === b.key && (  // 先比较key值
      (
        a.tag === b.tag &&  // 标签名
        a.isComment === b.isComment && // 是否是注释
        isDef(a.data) === isDef(b.data) &&  // 是否都有data
        sameInputType(a, b)             // 如果是input标签 type是否一样
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
#### patchVnode 源码
```javascript
function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      // 如果 相等 直接返回
      return
    }
    // oldVnode.elm 和 vnode.elm指向同一块内存空间 两者的改动都能响应到elm上
    const elm = vnode.elm = oldVnode.elm
    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }
    // 取出两个节点的子节点
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      // 执行update钩子函数
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)){
      if (isDef(oldCh) && isDef(ch)) {
        // 如果都有子节点 则执行diff的核心updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 如果vnode有子节点 但是oldVnode没有 则为创建子节点
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 如果vnode没有子节点 但是oldVnode有 则为删除子节点
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 如果都没有子节点 且oldVnode是文本节点 直接将文本置空
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果两个都是文本节点  直接替换文本
      // 一般是递归到最底层的时候进入到这个判断
      nodeOps.setTextContent(elm, vnode.text)
    }
  }
```
#### 接下来看diff算法的核心updateChildren
```javascript
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // 取四个指针 分别指向oldCh 和 newCh的头和尾
    // 并取四个指针指向的值
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly一般都是false
    // 只有在<transition-group>组件的时候才是true 因为transition必须要通过删除重建才会使过渡效果正常
    const canMove = !removeOnly
    // 递归的去patch子节点
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 当oldStartVnode == newStartVnode的时候 代表oldStartVnode位置没有变 直接复用oldStartVnode
        // 同时oldStartIdx后移  newStartIdx后移
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // oldEndVnode == newEndVnode 代表oldEndVnode位置没有变 直接复用oldEndVnode
        // 同时oldEndIdx前移 newEndIdx前移
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { 
        // oldStartVnode == newEndVnode 代表oldStartIdx指向的node 与newEndVnode指向的node是同一节点
        // 则将oldStartIdx指向的node移动到 oldEndVnode的后面
        // 同时oldStartIdx后移  newEndIdx前移
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { 
        // oldEndVnode == newStartVnode 代表oldEndVnode指向的node 与newStartVnode指向的node是同一节点
        // 则将oldEndIdx指向的node移动到 oldStartVnode的前面
        // 同时newStartIdx后移  oldEndIdx前移
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 如果四种情况都不符合  oldKeyToIdx 是指old key to Idx的映射 
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        // 看看oldVnode中是否有 key===newStartVnode.key
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
          // 如果没有  则是新element 直接创建
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 否则 如果oldVnode中有key 与  newStartVnode key相等的话
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // 并且sameVnode 就直接将vnodeToMove移动到oldStartVnode的前面 不会新建一个
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // 如果相同的key 但是标签不一样  也会新建
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // 这个过程中oldStartIdx， newStartIdx会不停后移  oldEndIdx，newEndIdx不断前移
    // 如果oldStartIdx > oldEndIdx代表old先走完 而new还没走完 则按照下标addVnodes
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      // 如果newStartIdx > newEndIdx代表new先走完 而old还没走完 则removeVnodes
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
```
##### 图解diff过程
![](/images/VUE_DIFF/diff.png)
1. 第一步
```javascript
 oldStartVnode === newStartVnode // oldStartVnode保持不变
 oldStartIdx += 1;
 newStartIdx += 1
```
2. 第二步
```javascript
 oldStartVnode === newEndVnode // 将oldStartVnode移动到oldEndVnode后面 此时realDom 是 a d b
 oldStartIdx += 1;
 newEndIdx -= 1
```
3. 第三步
```javascript
 oldEndVnode === newEndVnode // oldEndVnode位置不变 此时realDom 还是 a d b
 oldEndIdx -= 1;
 newEndIdx -= 1
```
3. 第四步
```javascript
 // 此时oldEndIdx 已经 < oldStartIdx了  old已经走完
 // 将c按照下标插入到dom上     此时realDom 是a c d b
```
#### 思考
##### 关于vue在列表渲染中为什么要添加一个独一无二的key？
如果列表渲染的时候没有key 那么`undefined === undefined`, 直接进入到`sameVnode(oldStartVnode, newStartVnode) === true` 的判断
会使用就地更新策略而不是移动dom元素, 如果只是简单的列表展示的话, 直接替换文本, 不用创建标签。这种模式更加高效，但只适用于不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出。[例子](https://jsbin.com/numiwog/edit?html,output)
如果是列表123 变成了13, 如果是就地更新 的话 会把2 update to 3, 再delete 3, 如果不是就地更新就不用移动13的位置, 直接删除2

  ##### 以及key在diff算法中的作用
  key在diff算法中的作用就是避免就地复用策略带来的副作用,key是判断两个节点是否为sameNode的重要凭证