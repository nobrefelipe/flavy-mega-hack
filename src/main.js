import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import './registerServiceWorker'

// ANT DESIGN
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
Vue.use(Antd)



//DIRECTIVES
import lazyLoadImage from './directives/lazy-load-images';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  directives: {lazyLoadImage},

  render: h => h(App)
}).$mount('#app')
