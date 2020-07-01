import Vue from 'vue'

import Order from '../OrderClass'

export default {
    namespaced: true,
    // -----------------------------------------------------------------
    state: {
        openOrder:{},

        someOrder:{},

    },
    // -----------------------------------------------------------------
    getters: {

        user: state => state.currentUser

    },
    // -----------------------------------------------------------------
    mutations: {
        addToOrder: (state, payload) => {

            Vue.set(state, 'openOrder', payload)

        },

        addToSomeOrder: (state, payload) => {

            Vue.set(state, 'someOrder', payload)

        }

    },
    // -----------------------------------------------------------------
    actions: {

        setOpenOrder: (context, payload) => {

            let newOrder = new Order(payload)


            context.commit('addToOrder', newOrder)

        }

    }
}