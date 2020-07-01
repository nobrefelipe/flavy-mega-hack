<template>

    <section v-if="!data.outOfStock" class="menu-item">

        <router-link :to="`/${$route.params.restaurantId}/food-detail/${data.slug}`" class="menu-item--image-link">

            <figure><img v-lazy-load-image :data-src="`https://res.cloudinary.com/flavy/image/upload/c_scale,w_200/${data.imageUrl}`" alt=""></figure>

        </router-link>

        <router-link :to="`/${$route.params.restaurantId}/food-detail/${data.slug}`">

            <div class="menu-item--body">

                <h3 class="menu-item--name">{{ data.title }}</h3>

                <p style="font-size: 12px; line-height: 14px">{{data.description}}</p>

                <h4 class="menu-item--price">{{ currency }}{{ data.price_in_cents / 100}}</h4>

            </div>

        </router-link>

        <a-icon type="arrow-right" />

        <button v-if="isDrinkable"
                @click="addToOrder(data, $event)"  class="add-to-cart" ref="addToOrder"><a-icon type="plus" /></button>

    </section>

</template>

<script>

    import uniqid  from 'uniqid';

    export default {
        name: "MenuItem",

        props: {

            data: { type: Object,  required: true }

        },

        data: () => ({

            currency: "R$",

            amount: 1

        }),

        computed:{

            isDrinkable(){

                let isDrinkable = (
                    this.data.filter == 'drink' ||
                    this.data.filter == 'drinks' ||
                    this.data.filter == 'birra' ||
                    this.data.filter == 'Drinks' ) ? true : false

                return isDrinkable;

            },

        },

        methods:{



            addToOrder(item){

                this.$refs.addToOrder.classList.add('tapped')

                let tableNumber = localStorage.getItem("tableNumber");

                // The opened order, if there is one
                let openOrder = this.$store.state.OrderModule.openOrder;

                // Random order id
                let orderId = openOrder.orderId ? openOrder.orderId  : uniqid(`T${tableNumber}-`);

                // Total = product just add + orderTotal
                let orderTotal = openOrder.orderId ? ( openOrder.order_total_in_cents + (item.price_in_cents * this.amount)) : (item.price_in_cents * this.amount);


                // The new product to add to the order
                let orderToAdd = {

                    id: item.id,
                    title: item.title,
                    toppings: [],
                    amount: this.amount,
                    imageUrl: item.imageUrl,
                    customText: "",
                    price_to_pay_in_cents: item.price_in_cents

                };


                // make sure currentItems is always an array
                let currentOrdersArray = openOrder.orderItems ? openOrder.orderItems : []


                // the open order object
                let openOrderObj = {

                    orderId: orderId,

                    date: new Date(),

                    tableNumber: tableNumber,

                    order_total_in_cents: orderTotal,

                    orderItems:[...currentOrdersArray]// increment orden items

                };


                // Push the new item to the order items array
                openOrderObj.orderItems.push(orderToAdd);

                // Add to the order
                // this.$store.commit('OrderModule/addToOrder', openOrderObj)
                this.$store.dispatch('OrderModule/setOpenOrder', openOrderObj)

                // Vibrate for 500ms
                navigator.vibrate([500]);


               setTimeout( () => {
                   this.$refs.addToOrder.classList.remove('tapped')
               },500)


            },

        }

    }

</script>

<style lang="scss">

    .menu-item{

        position: relative;

        float: left;

        width: 100%;

        padding: 0 0 20px 0;

        margin: 0 0 20px 0;

        display: flex;


        &:after{

            content: "";

            position: absolute;

            bottom:0; left: 10%;

            width: 80%;

            height: 1px;

            float: left;


            background: rgba(0,0,0,0.08);

        }

        figure{

            min-width: 140px;

            height: 140px;

            /*border-radius: 6px;*/

            /*box-shadow: 0 2px 6px rgba(0,0,0,0.3);*/

            img{ object-fit: contain; max-height: 120px}

        }


        &--image-link{

            float: left;

            width: 140px;

        }

        &--body{

            display: flex;

            flex-direction: column;

            justify-content: center;

            min-width: calc(100% - 125px);

            margin-left: 10px;

            padding-right: 40px;

        }

        &--name{

            font-size: 18px;
            font-family: 'Futura-Medium';
            color: var(--color-secondary);
            text-transform: capitalize;

        }

        &--price{

            font-size: 16px;

            color: var(--color-primary);

            font-family: 'Futura-Medium';

        }

        .anticon-arrow-right{

            position: absolute;

            right: 10px;

            bottom: 50%;

            transform: translateY(-50%);

            font-size: 16px;

            color: var(--color-secondary);

            opacity: 0.5;

        }


        .add-to-cart{

            position: absolute;

            bottom: 5px;

            right: 15px;

            border-radius: 40px;

            width: 45px;

            height: 45px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: var(--color-primary);

            color: #fff;

            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3), 0 8px 14px -8px rgba(0,0,0,.5);

            transition: all .3s ease;

            &.tapped{

                background: var(--color-secondary);

                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);


            }

        }


    }

</style>
