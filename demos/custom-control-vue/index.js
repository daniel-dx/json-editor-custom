
// 1. 增加自定义resolver
JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === "string" && schema.format === "custom-type") return "customType";
});

// 2. 增加自定义editor
JSONEditor.defaults.editors.customType = JSONEditor.AbstractEditor.extend({
  vm: null,
  setValue: function(value) {
    var changed = this.getValue() !== value;
    if (changed) {
      this.vm.$data.modelValue = value; // 同步数据: json-editor => Vue 组件
      this.value = value;
    }
    this.onChange(changed); // 通知值发生变化 - 父级元素会自动刷新值
  },
  build: function () {
    var self = this;

    this.schema.formatConfig = this.schema.formatConfig || {};

    // 取得表单控件相关显示信息
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

    // 构造表单控件
    this.wrapper = document.createElement('div');
    this.wrapper.innerHTML = [
      '<vue-comp v-model="modelValue" :border-color="\'' + this.schema.formatConfig.borderColor + '\'"></vue-comp>'
    ].join('');
    this.control = this.theme.getFormControl(this.label, this.wrapper, this.description);
    this.container.appendChild(this.control);

    // 渲染Vue组件
    this.vm = new Vue({
      el: this.control,
      data: {
        modelValue: '',
      },
      watch: {
        modelValue(newVal) {
          self.setValue(newVal); // 同步数据：Vue组件 =》json-editor
        }
      }
    });
  }
});


// ========================== 老套的华丽丽分割线，以下假装是个Vue组件 ========================== //

Vue.component('vueComp', {
  template: '<div>vue component: <input type="text" v-bind:value="value" v-on:input="updateValue($event.target.value)" :style="{\'border-color\': borderColor}"></div>',
  props: ['value', 'borderColor'],
  methods: {
    updateValue(val) {
      this.$emit('input', val);
    }
  }
})