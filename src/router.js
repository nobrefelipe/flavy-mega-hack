import Vue from 'vue'
import Router from 'vue-router'
import Welcome from './views/Welcome.vue'
import Store from './store/store';

Vue.use(Router)


const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [

        {
            path: '/',
            name: 'Index',
            component: () => import(/* webpackChunkName: "index" */ './views/index.vue')
        },

        {
            path: '/scan',
            name: 'Scan',
            component: () => import(/* webpackChunkName: "scan" */ './views/scan.vue')
        },

        {
            path: '/:restaurantId',
            name: 'Welcome',
            component: Welcome,
            meta: {
                page: 1
            }
        },
        {
            path: '/:restaurantId/menu',
            name: 'menu',
            component: () => import(/* webpackChunkName: "theMenu" */ './views/menu.vue'),
            meta: {
                page: 2
            }
        },
        {
            path: '/:restaurantId/food-detail/:slug',
            name: 'food-detail',
            component: () => import(/* webpackChunkName: "foodDetail" */ './views/FoodDetail.vue'),
            meta: {
                page: 3
            }
        },
        
        {
            path: '/:restaurantId/orders',
            name: 'orders',
            component: () => import(/* webpackChunkName: "Orders" */ './views/Orders.vue'),
            meta: {
                page: 4
            }
        },

        {
            path: '/:restaurantId/thank-you',
            name: 'thank-you',
            component: () => import(/* webpackChunkName: "thankyou" */ './views/Thank-you.vue'),
            meta: {
                page: 5
            }

        },

        {
            path: '/:restaurantId/status/:orderId',
            name: 'OrderStatus',
            component: () => import(/* webpackChunkName: "OrderStatus" */ './views/OrderStatus.vue'),
            meta: {
                page: 5
            }

        },

    ],
    scrollBehavior() {
        return {x: 0, y: 0}
    }
})


export default router;