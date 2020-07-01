import Vue from 'vue'

export default {

    namespaced: true,

    // -----------------------------------------------------------------
    state: {


    },
    // -----------------------------------------------------------------
    getters: {

    },
    // -----------------------------------------------------------------
    mutations: {


        setMenu: (state, payload) => {

            Vue.set(state, `restaurantMenu`, payload[0])

        },

        setMenuCategories: (state, payload) => {

            Vue.set(state, `restaurantMenuCategories`, payload)

        },

        setTable: (state, payload) => {

            Vue.set(state, `table`, payload)

        },

        setRestaurantName: (state, payload) => {

            Vue.set(state, `restaurantName`, payload[0])

        },

        setRestaurantStripePK: (state, payload) => {

            Vue.set(state, `restaurantStripePK`, payload)

        }


    },
    // -----------------------------------------------------------------
    actions: {


        getMenu: async (context, customerId) => {


            await fetch(`https://us-central1-flavy-app.cloudfunctions.net/getRestaurant?customerId=${customerId}`, { method: 'GET' })

                .then(function(response) {

                    return response.json();

                }).then( data => {

                    if(data.menu){

                        context.commit('setMenu', [data.menu, customerId]);
                        context.commit('setMenuCategories', data.menuCategories);
                        context.commit('setRestaurantName', [data.restaurant, customerId]);
                        context.commit('setRestaurantStripePK', data.customerStripePublicKey);

                        localStorage.setItem("restaurantInfo", JSON.stringify(data.restaurantInfo))

                    }else{

                        console.log("no data to show")

                    }

                }).catch( error => {

                    window.location.href = '/'

                    console.log("[ERROR]", error)

                });



        },


    }
}