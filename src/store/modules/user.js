import Vue from 'vue'

export default {
    namespaced: true,
    // -----------------------------------------------------------------
    state: {
        currentUser: ""
    },
    // -----------------------------------------------------------------
    getters: {

        user: state => state.currentUser

    },
    // -----------------------------------------------------------------
    mutations: {
        setUser: (state, user) => {

            Vue.set(state, 'currentUser', user)
        }
    },
    // -----------------------------------------------------------------
    actions: {

        setCurrentUser: (context, user) => {

            context.commit('setUser', user)

        }

    }
}