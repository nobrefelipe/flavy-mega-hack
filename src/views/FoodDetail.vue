<template>

    <section class="view-wrapper food-detail">

        <header class="view-header">

            <span class="back" @click="$router.push({ name: 'menu', params: { restaurantId: $route.params.restaurantId } })"><a-icon type="left" />MENU</span>

        </header>

        <section class="food-detail--slideshow">

            <figure style="height: 280px"><img v-lazy-load-image :data-src="`https://res.cloudinary.com/flavy/image/upload/c_scale,h_300/${food.imageUrl}`" :alt="food.title"></figure>

        </section>


        <div class="body">


            <div class="title-wrapper">

                <h1 class="food-detail--title">{{ food.title }}</h1>

                <span class="food-detail--price">R${{ food.price_in_cents / 100 }}</span>


            </div>

            <!-- FOOD DESCRIPTION -->
            <p class="food-detail--description">{{ food.description }}</p>
            <p v-if="food.allergens" class="food-detail--description" style="color: #333">Alérgicos: {{ food.allergens }}</p>


            <!-- DRINKS AMOUNT-->
            <div v-if="isDrinkable" class="order-quantity-components">

                <button class="button default" style="width: 50px" @click="amount >1  ? amount-- : 1"><a-icon type="minus" /></button>
                <input type="number" v-model="amount">
                <button class="button default" style="width: 50px" @click="amount++"><a-icon type="plus" /></button>

            </div>


            <!-- INGREDIENTS CUSTOMIZATION -->
            <div v-if="!isDrinkable" class="food-detail--ingredients" ref="ingredients" >

                <span class="remove-ingredient blue-link" @click="showRemoveIngredientsModal">remover ingredientes</span>

                <p v-if="customizedText" style="font-size: 13px; color: #f00">{{customizedText}}</p>

            </div>



            <!-- TOPPINGS -->
            <div v-if="food.toppings.length" class="food-detail--toppings custom-checkbox">

                <h6>Toppings <span>+ R$1 cada</span></h6>

                <a-checkbox-group @change="onChangeToppings">

                    <a-checkbox v-for="item in food.toppings" :value="item" >

                        <a-icon type="plus" />

                        <a-icon type="cross" />

                        {{item}}

                    </a-checkbox>

                </a-checkbox-group>

            </div>


        </div>


        <a-modal title="Remover igredientes" v-model="visible" class="remove-ingredients-modal custom-checkbox" @ok="handleRemoveIngredients">

            <a-textarea placeholder="Sem cebola" :rows="4" v-model="customizedText"/>

        </a-modal>


        <div class="cta-wrapper">

            <button class="button primary" @click="addToOrder">R${{ addToOrderAmount / 100 }} <span>ADICIONAR</span></button>

        </div>

    </section>

</template>

<script>

    import uniqid  from 'uniqid';

    export default {

        name: "FoodDetail",

        data: () => ({

            visible: false,

            amount: 1,

            customizedText: "",

            removedIngredients:[],

            toppingsAdded: [],

        }),


        computed:{

            isDrinkable(){

                let isDrinkable = (
                    this.food.filter == 'drink' ||
                    this.food.filter == 'drinks' ||
                    this.food.filter == 'Drinks' ||
                    this.food.filter == 'birra' ||
                    this.food.filter == 'beer' ||
                    this.food.filter == 'birre') ? true : false

                return isDrinkable;

            },

            addToOrderAmount(){

                // toppings price to add (currently each topping = 1 euro )
                let toppingsPrice = this.toppingsAdded.length  * 100;

                return (this.food.price_in_cents * this.amount) + toppingsPrice

            },

            food(){

                let menu = this.$store.state.MenuModule.restaurantMenu;

                if(menu){

                    let food = menu.filter( item => {

                        return item.slug == this.$route.params.slug

                    });

                    return food[0]

                }


            }

        },

        methods:{

            // MAKE SURE WE DONT ADD ANYTHING TO THE CART WITHOUT HAVING A TABLE SET
            verifyTableNumber(){

                let tableNumber = localStorage.getItem("tableNumber");

            },

            addToOrder(){

                let tableNumber = localStorage.getItem("tableNumber");

                // The opened order, if there is one
                let openOrder = this.$store.state.OrderModule.openOrder;

                // Random order id
                let orderId = openOrder.orderId ? openOrder.orderId  : uniqid(`T${tableNumber}-`);

                // toppings price to add (currently each topping = 1 euro )
                let toppingsPrice = this.toppingsAdded.length  * 100;

                // Total = product just add + orderTotal
                let orderTotal = openOrder.orderId ? ( openOrder.order_total_in_cents + (this.food.price_in_cents * this.amount) + toppingsPrice) : (this.food.price_in_cents * this.amount) + toppingsPrice;


                // The new product to add to the order
                let orderToAdd = {

                    id: this.food.id,
                    title: this.food.title,
                    toppings: this.toppingsAdded,
                    amount: this.amount,
                    imageUrl: this.food.imageUrl,
                    customText: this.customizedText,
                    price_to_pay_in_cents: this.food.price_in_cents + toppingsPrice

                };


                // make sure currentItems is always an array
                let currentOrdersArray = openOrder.orderItems ? openOrder.orderItems : []


                // the open order object
                let openOrderObj = {

                    orderId: orderId,

                    date: new Date(),

                    tableNumber: this.verifyTableNumber(),

                    order_total_in_cents: orderTotal,

                    orderItems:[...currentOrdersArray]// increment orden items

                };


                // Push the new item to the order items array
                openOrderObj.orderItems.push(orderToAdd);

                // Add to the order
                // this.$store.commit('OrderModule/addToOrder', openOrderObj)
                this.$store.dispatch('OrderModule/setOpenOrder', openOrderObj)

                this.$router.push({ name: 'menu', params: { restaurantId: this.$route.params.restaurantId } })

                // Vibrate for 500ms
                navigator.vibrate([500]);


            },

            onChangeIngredients (checkedValues) {


                this.removedIngredients = checkedValues
                console.log(checkedValues)

            },

            onChangeToppings(checkedValues){

                this.toppingsAdded = checkedValues

            },

            showRemoveIngredientsModal() {

                this.visible = true

            },

            handleRemoveIngredients(e) {

               // save to order object


                let vm = this;

                this.$refs['ingredients'].classList.add("highlight");

                setTimeout( () => {

                    vm.$refs['ingredients'].classList.remove("highlight");

                }, 800)

                this.visible = false

            },

        },

        mounted(){

            let vm = this;


            //Make sure we always have the menu
            if(!this.menuItems){

                this.$store.dispatch('MenuModule/getMenu', this.$route.params.restaurantId)

                    .then( () => {

                        vm.loading = false

                    });

            }

        }


    }
</script>

<style scoped>

</style>