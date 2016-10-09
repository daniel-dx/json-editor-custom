

Vue.component('datepicker', {
  template: 'vue component: <input type="text" v-model.lazy="modelValue"></div>',
  props: ['modelValue', 'onModelValueChanged'],
  watch: {
    modelValue(val) {
      this.onModelValueChanged(val);
    }
  },
  mounted() {
    console.log('vue component mounted');
  }
})


// ==================================================================== //


JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === "string" && schema.format === "custom-type") return "customType";
});

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
      '<datepicker :model-value="modelValue" :on-model-value-changed="modelValueChanged"></datepicker>'
    ];
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







