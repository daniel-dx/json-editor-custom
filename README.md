
该项目意在指导开发人员在[json-editor](https://github.com/jdorn/json-editor)之上新增自定义的`format`

## 写在最前面

想看该项目的demo的运行效果，请先安装`node`，然后`npm install`，然后就可以简单粗野地把`index.html`拖到浏览器了

## 如何自定义操作控件？


## 如何自定义布局？


## 如何自定义表单控件 之 Vue组件？

可参考`demos/custom-control-vue/index.js`

### 1. 增加resolver

```
JSONEditor.defaults.resolvers.unshift(function (schema) { ... })
```

如下：

```
JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === "string" && schema.format === "custom-type") return "customType";
});
```

### 2. 增加editor

```
JSONEditor.defaults.editors.xxx = JSONEditor.AbstractEditor.extend({ ... })
```

其中`xxx`为自定义类型名，如下：

```
JSONEditor.defaults.editors.customType = JSONEditor.AbstractEditor.extend({
  vm: null, // 保存vue实例对象
  setValue: function(value) {
    ...
  },
  build: function () {
    ...
  }
});
```

### 3.将Vue组件整合进去

以`customType`为例

```
JSONEditor.defaults.editors.customType = JSONEditor.AbstractEditor.extend({
  vm: null,
  setValue: function(value) {
    var changed = this.getValue() !== value;
    if (changed) {
      this.vm.$data.modelValue = value;
      this.value = value;
    }
    this.onChange(changed); // 通知值发生变化 - 父级元素会自动刷新值
  },
  build: function () {
    var self = this;

    // 取得表单控件相关显示信息
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

    // 构造表单控件
    this.wrapper = document.createElement('div');
    this.wrapper.innerHTML = [
      '<vue-comp :model-value="modelValue" :on-model-value-changed="modelValueChanged"></vue-comp>'
    ].join('');
    this.control = this.theme.getFormControl(this.label, this.wrapper, this.description);
    this.container.appendChild(this.control);

    // 启动Vue
    this.vm = new Vue({
      el: this.control,
      data: {
        modelValue: '',
      },
      methods: {
        modelValueChanged(newVal) {
          self.setValue(newVal); // 同步json-editor value
        }
      }
    });
  }
});
```

接下来剖析下上面的代码

- `画`出表单控件

```
// 取得表单控件相关显示信息
if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

// 构造表单控件
this.wrapper = document.createElement('div');
this.wrapper.innerHTML = [
  '<vue-comp :model-value="modelValue" :on-model-value-changed="modelValueChanged"></vue-comp>'
].join('');
this.control = this.theme.getFormControl(this.label, this.wrapper, this.description);
this.container.appendChild(this.control);
```

- 渲染Vue组件

```
this.vm = new Vue({
  el: this.control,
  ...
});
```

- 同步数据 json-editor => Vue 组件

```
setValue: function(value) {
  var changed = this.getValue() !== value;
  if (changed) {
    this.vm.$data.modelValue = value; // 同步数据: json-editor => Vue 组件
    this.value = value;
  }
  this.onChange(changed); // 通知值发生变化 - 父级元素会自动刷新值
}
```

- 同步数据 Vue组件 =》json-editor

```
methods: {
  modelValueChanged(newVal) {
    self.setValue(newVal); // 同步数据：Vue组件 =》json-editor
  }
}
```