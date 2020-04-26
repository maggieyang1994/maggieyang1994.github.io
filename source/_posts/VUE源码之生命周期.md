---
title: 结合源码看生命周期
categories:
  - VUE源码
rank: 2
tags: 
  - vue源码
  - 生命周期
  - 模板编译
---

![](https://cn.vuejs.org/images/lifecycle.png)

#### beforeCreate

```javascript
// instance/init.js
initLifecycle(vm);
initEvents(vm);
initRender(vm);
callHook(vm, "beforeCreate");
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, "created");
if (vm.$options.el) {
  vm.$mount(vm.$options.el);
}
```

在 initLifecycle,event,render 之后， initState 之前， 所以这里只能拿到$attrs, $listeners, 无法拿到 data， methods 等等

#### created

```javascript
// instance/state.js
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props); // 初始化prop
  if (opts.methods) initMethods(vm, opts.methods); // // 初始化method
  if (opts.data) {
    initData(vm); // 初始化data, 并调用observe(data, true /* asRootData */);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed); // 初始化computed
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch); // 初始化watch
  }
}
```

在 initstate 之后，这里可以拿到 data, methods 等, 所以页面初始化请求数据的动作一般放在created

#### beforeMount

[链接](https://juejin.im/post/5ccafd4d51882540d472a90e)
vue 基于源码构建 会有两个版本 一个是运行时 和 运行时加编译器，挂载的时候有两条分支
如果没有指定 render 函数 则需要编译器将 template 模板编译成 render 函数(这里模板编译不做详细介绍)
如果指定了 render 函数 则不需要编译器

其中没有指定 render 函数分为指定了 template 和没有 template 两种
如果没有 template 则直接用 el.outerHTML 作为模板编译
而指定 template, template 又有三种写法

1. 字符串模板

```javascript
var vm = new Vue({
  el: "#app",
  template: "<div>模板字符串</div>",
});
```

2. 选择符匹配元素的 innerHTML 模板

```javascript
<div id="app">
  <script type="x-template" id="test">
    <p>test</p>
  </script>
</div>;
var vm = new Vue({
  el: "#app",
  template: "#test",
});
```

3. dom 元素匹配的 innerHTML 模板

```javascript
<div id="app">
  <span id="test">test2</span>
</div>;
var vm = new Vue({
  el: "#app",
  template: document.querySelector("#test"),
});
```

源码分别对这三种写法做了判断

```javascript
// platforms/web/entry-runtime-with-compiler.js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el);
  const options = this.$options;

  if (!options.render) {
    let template = options.template;
    if (template) {
      // 是否指定了template选项
      if (typeof template === "string") {
        //字符串模板 的template写法
        if (template.charAt(0) === "#") {
          template = idToTemplate(template);
        }
      } else if (template.nodeType) {
        // dom 元素匹配的 innerHTML 模板
        template = template.innerHTML;
      }
    } else if (el) {
      // 将el外部的html作为template编译
      template = getOuterHTML(el);
    }
    if (template) {
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== "production",
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }
  return mount.call(this, el, hydrating);
};
```

无论以什么样的方式挂载, 都会执行 mountComponent 函数
mountComponent 函数(简化版)

```javascript
// instance/lifecycle.js
export function mountComponent(
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el;
  callHook(vm, "beforeMount");

  let updateComponent;
  updateComponent = () => {
    // vm._render()生成一个虚拟dom
    vm._update(vm._render(), hydrating);
  };
  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, "beforeUpdate");
        }
      },
    },
    true /* isRenderWatcher */
  );
  hydrating = false;
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, "mounted");
  }
  return vm;
}
```

在 callHook(vm, 'beforeMount') 之前 执行了 vm.$el = el, 所以在beforeMount之前是拿不到vm.$el 的

#### mounted

new Watcher 的时候触发 watcher 的 getter,　也就是 updateComponent 函数, 进而触发 vm.\_update(vm.\_render(), hydrating)

```javascript
// instance/lifecycle.js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this;
  const prevEl = vm.$el;
  const prevVnode = vm._vnode;
  const restoreActiveInstance = setActiveInstance(vm);
  vm._vnode = vnode;
  if (!prevVnode) {
    // initial render
    // if !prevNode 新创建实例  传入 挂载的真实dom节点 vm.$el 和vnode(新生成的虚拟dom)
    // 最后转化成真实dom节点
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
  } else {
    // updates
    // else update 传入新旧的虚拟dom
    vm.$el = vm.__patch__(prevVnode, vnode);
  }
};
```

调用 patch 函数 传入挂载的真实 dom 节点和新生成的虚拟 dom, **数据才会真正的显示到页面上**

#### beforeUpdate

当数据发生改变的时候, 触发`dep.notify()`-->`watcher.update`
数据并不会马上更新页面上, 首先会加入到 queueWather 等待队列中去

```javascript
// observer/watcher.js
update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

对于在一次事件循环中改变多次的数据, updateComponent 回调只会 push 到队列中一次
等到下一次事件循环的时候再更新到页面上去

```javascript
// observer/scheduler.js
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id;
  // 首先用 has 对象保证同一个 Watcher 只添加一次
  // 一个watcher在同一个事件循环中的多次改动  只push一次
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      let i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}
```

```javascript
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  let watcher, id;
  // 对队列进行排序 确保父组件在子组件之前更新
  queue.sort((a, b) => a.id - b.id);
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      // 执行beforeUpdate生命周期函数
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    // 调用updateComponent函数
    watcher.run();
  }
  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  // 执行beforeUpdate生命周期函数
  callUpdatedHooks(updatedQueue);
}
```
#### updated
最终执行`vm.$el = vm.__patch__(prevVnode, vnode);`将改动更新到页面上去, 详情见隔壁 源码之diff算法

#### beforeDestroy
beforeDestroy钩子函数在实例销毁之前调用。在这一步，实例仍然完全可用。
```javascript
// instance/lifecycle.js
Vue.prototype.$destroy = function () {
    const vm: Component = this
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
```
#### destroyed
destroyed钩子函数在Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。
全部取消订阅