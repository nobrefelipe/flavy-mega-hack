import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import UserModule from './modules/user'
import MenuModule from './modules/menu'
import OrderModule from './modules/order'

Vue.use(Vuex)

export default new Vuex.Store({

    // plugins: [new VuexPersistence().plugin],

    modules: {

        UserModule,
        MenuModule,
        OrderModule
    }


})