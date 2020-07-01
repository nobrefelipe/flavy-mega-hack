<template>

    <section class="view-wrapper orders" >

        <header class="view-header">

            <span class="back" @click="$router.push({ name: 'menu', params: { restaurantId: $route.params.restaurantId } })"><a-icon type="left" />MENU</span>

            <div class="page-title">ORDEM</div>

        </header>

        <!-- ORDER ITEMS-->
        <section v-if="openOrder.orderItems.length && stripePK" class="orders-body" :class="{ processing: processing}">

            <div class="order-top">
                
                <span class="order-id">Ordem: {{ openOrder.orderId }}</span>

                <button class="table" @click="modalVisible = true">
                    <div v-if="tableNumber">Mudar mesa <span>({{tableNumber}})</span></div>
                    <div v-else>Inserir mesa</div>
                    
                </button>

            </div>

            <div v-for="(item, index) in openOrder.orderItems"  :key="index" class="orders-item">

                <figure><img v-lazy-load-image :data-src="`https://res.cloudinary.com/flavy/image/upload/c_scale,h_300/${item.imageUrl}`" alt=""></figure>


               <div>

                   <span class="orders-item--title">{{ item.title }}</span>


                   <span class="orders-item--edited" v-if="item.customText">

                       <strong style="color: #000">Riechiesta: </strong>
                       <span>{{ item.customText }}</span>

                    </span>

                   <div class="orders-item--toppings" v-if="item.toppings.length">

                       <strong style="color: #000">Aggiungere: </strong>

                       <span v-for="topping in item.toppings" :key="topping">{{ topping }}, </span>

                   </div>

                   <div class="orders-item--total">R${{ item.price_to_pay_in_cents / 100 * item.amount }}</div>

                   <button class="orders-item--delete" @click="deleteOrder(index)"><a-icon type="delete" /></button>


                   <!-- DRINKS AMOUNT-->
                   <div class="order-quantity-components" style="justify-content: flex-start">

                       <button class="button default" style="width: 50px" @click="updateAmount(index, 'minus')"><a-icon type="minus" /></button>
                       <input type="number" :value="item.amount">
                       <button class="button default" style="width: 50px"  @click="updateAmount(index, 'plus')"><a-icon type="plus" /></button>

                   </div>

               </div>

            </div>

        </section>

        <!-- NO ORDERS FOUND -->
        <section v-else class="orders-body row">

            <div style="padding: 20vh 30px; text-align: center">

                <h3>Oppps! <br>Niente qui. Torna dal menu per ordinare qualcosa.</h3>

                <br><br>

                <span class="button primary" @click="$router.push({ name: 'menu', params: { restaurantId: $route.params.restaurantId } })">MENU</span>

            </div>

        </section>

        <!-- PAYMENT OPTIONS -->
        <div class="payment-options" v-if="openOrder.orderItems.length && stripePK">

            <div class="total">

                <span>TOTAL</span>

                <button class="table" @click="modalVisible = true">
                    <div v-if="tableNumber">Mudar mesa <span>({{tableNumber}})</span></div>
                    <div v-else>Inserir mesa</div>
                    
                </button>

                <span class="total-amount">R${{ openOrder.order_total_in_cents / 100 }}</span>

            </div>

            <p>Metódo de pagamento</p>

            <div style="display: flex">

                <!-- CARD -->
                <button  class="button default" @click="onChooseCardPayment"><a-icon type="credit-card" />Cartāo</button>


            </div>

        </div>

        <!-- CREDIT CARD PAYMENT -->
        <div v-if="openOrder.orderItems.length && stripePK" class="pay-widget" :class="{show:show}" style="display: flex; flex-direction: column; float: left; width: 100%">

            <div class="close" @click="show=false"><a-icon type="close-circle" /></div>

            <div class="total">

                <span>TOTAL</span>

                <button class="table" @click="modalVisible = true">
                    <div v-if="tableNumber">Mudar mesa <span>({{tableNumber}})</span></div>
                    <div v-else>Inserir mesa</div>
                    
                </button>

                <span class="total-amount">R${{ openOrder.order_total_in_cents / 100 }}</span>

            </div>

            <!--

                 APPLE PAY WIDGET

             -->
            <div v-show="showDevicePaymentButton">

                <div id="payment-request-button">PAY</div>

            </div>

            <!--

                 CARD PAYMENT WIDGET

             -->
            <form v-on:submit.prevent  id="payment-form" style="width: 100%"  v-show="showCardPaymentForm">

                <div class="form-row">

                    <div id="card-element"><!-- A Stripe Element will be inserted here. --></div>

                    <!-- Used to display form errors. -->
                    <div id="card-errors" role="alert"></div>

                </div>

                <button class="button secondary"><a-icon type="loading" v-if="processing"/>{{ paymentButtonText }}</button>

                <label for="card-element" style="font-size: 11px; line-height: 9px !important; color:green">
                    Pagamento seguro. Flavy não salva o número do seu cartão de crédito, nem mantém referimento da sua conta bancária.
                </label>


            </form>

        </div>

         <a-modal title="Inserir numero da mesa" v-model="modalVisible" @cancel="modalOnCancel"  @ok="setTableNumber">
            
            <input type="tel"  v-model="table"  />

        </a-modal>


    </section>
    
</template>

<script>

    import uniqid  from 'uniqid';

    export default {
        name: "orders",

        data(){

            let self = this;

            let resInfo = JSON.parse(localStorage.getItem("restaurantInfo"));

            return{

                modalVisible: false,

                table: null,

                PN_TOKEN: null,

                showDevicePaymentButton: false,

                showCardPaymentForm: false,

                processing: false,

                firecloudAPI: "https://us-central1-flavy-app.cloudfunctions.net",

                stripePK: self.$store.state.MenuModule.restaurantStripePK,

                paymentButtonText: "PAGAR",

                cashPaymentText: "dinheiro",

                finalCustomerName: "",

                show: false,

                modalVisibile: false,

                resLat: resInfo.lat,
                restLong: resInfo.long,
                currentLat: "",
                currentLong: "",
                range:"",
                distance: "",
                accuracy: "",
                inrange: false

            }

        },

        mounted(){

            let vm = this;

            var stripe = Stripe(this.stripePK);

            let customerId = this.$route.params.restaurantId;

            /**
             *
             * PAYMENT REQUEST API BUTTON (Apple Pay || Google Pay)
             *
             **/

            var paymentRequest = stripe.paymentRequest({
                country: 'IT',
                currency: 'eur',
                total: {
                    label: vm.openOrder.orderId,
                    amount:  vm.openOrder.order_total_in_cents,
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            var elements = stripe.elements();

            const prButton = elements.create('paymentRequestButton', { paymentRequest: paymentRequest });

            // Check the availability of the Payment Request API first.
            paymentRequest.canMakePayment().then(function(result) {

                if (result != null) {

                    //show device payment system

                    vm.showDevicePaymentButton = true;

                    vm.showCardPaymentForm = false;

                    prButton.mount('#payment-request-button');


                } else {

                    vm.showDevicePaymentButton = false;

                    vm.showCardPaymentForm = true;

                }

            });

            let stripeIntents_config = {

                method: 'POST' ,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vm.openOrder),

            };


            // Payment Request
            paymentRequest.on('paymentmethod', function(ev) {

                // FIRST: WE REQUEST A PAYMENT AUTHORIZATION TO STRIPE AND SEND THE ORDER TO CALCULATE THE SAFE TOTAL IN THE BACKEND
                fetch(`${vm.firecloudAPI}/stripeIntents?customerId=${customerId}`, stripeIntents_config)

                // SECOND: THE SERVER WILL RETURN A  - paymentIntent -  OBJECT WITH THE PAYMENT METADATA
                // WE DONT CAPTURE THE AMOUNT NOW, WE WAIT FOR THE WAITER TO ACCEPT THE ORDER
                    .then(response => {

                        return response.json();

                    }).then(data => {

                    // THIRD: WE SAVE THE - paymentIntent - ID WITH THE ORDER,
                    // SO WE CAN USE IT FROM THE RESTAURANT DASHBOARD WHEN THE WAITER ACCEPTS THE ORDER
                    // WE SEND IT BACK TO A FIREBASE FUNCTION THAT WILL CAPTURE THE MONEY
                    let openOrder = vm.openOrder;
                        openOrder.paymentIntentID = data.paymentIntent.id;
                        openOrder.pnToken = vm.PN_TOKEN;

                    let clientSecret = data.paymentIntent.client_secret;

                    stripe.confirmPaymentIntent(clientSecret, {

                        payment_method: ev.paymentMethod.id,

                    }).then(function (confirmResult) {

                        console.log("confirmPaymentIntent: ", confirmResult)

                        if (confirmResult.error) {

                            // Report to the browser that the payment failed, prompting it to
                            // re-show the payment interface, or show an error message and close
                            // the payment interface.
                            ev.complete('fail');
                        } else {

                            // Report to the browser that the confirmation was successful, prompting
                            // it to close the browser payment method collection interface.
                            ev.complete('success');

                            stripe.handleCardPayment(clientSecret).then(function(result) {

                                if (result.error) {

                                    console.log(result.error)
                                    alert("The payment failed, try another payment method")

                                } else {

                                    console.log("[ SUCCESS ]", result)

                                    let sendOrderToFirebase_config = {

                                        method: 'POST' ,
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(openOrder),

                                    };

                                    // FIFTH : WE SEND THE ORDER TO THE DATABASE
                                    fetch(`${vm.firecloudAPI}/sendOrderToFirebase?customerId=${customerId}&paymentMethod=PaymentRequestButton`, sendOrderToFirebase_config);

                                    // SIXTH : Send to Order Status page
                                    this.$router.push({ name: 'OrderStatus', params: { orderId: this.openOrder.orderId } })

                                }

                            });

                        }

                    });

                });

            });




            /**
             *
             * CARD PAYMENT
             *
             *
             *
             **/


            let cardElement = elements.create('card');

            cardElement.mount('#card-element');

            let paymentForm = document.getElementById('payment-form');

            paymentForm.addEventListener('submit', function(ev) {

                vm.paymentButtonText = "Processing";

                vm.processing = true;


                let stripeIntents_config = {

                    method: 'POST' ,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vm.openOrder),

                };

                // FIRST: WE REQUEST A PAYMENT AUTHORIZATION TO STRIPE AND SEND THE ORDER TO CALCULATE THE SAFE TOTAL IN THE BACKEND
                fetch(`${vm.firecloudAPI}/stripeIntents?customerId=${customerId}`, stripeIntents_config)

                // SECOND: THE SERVER WILL RETURN A  - paymentIntent -  OBJECT WITH THE PAYMENT METADATA
                // WE DONT CAPTURE THE AMOUNT NOW, WE WAIT FOR THE WAITER TO ACCEPT THE ORDER
                    .then( response => {

                        return response.json();

                    }).then( data => {

                    console.log(data)

                    // THIRD: WE SAVE THE - paymentIntent - ID WITH THE ORDER,
                    // SO WE CAN USE IT FROM THE RESTAURANT DASHBOARD WHEN THE WAITER ACCEPTS THE ORDER
                    // WE SEND IT BACK TO A FIREBASE FUNCTION THAT WILL CAPTURE THE MONEY
                    let openOrder = vm.openOrder;
                        openOrder.paymentIntentID = data.paymentIntent.id;
                        openOrder.pnToken = vm.PN_TOKEN;


                    // FOURTH: WE GET THE PAYMENT TOKEN BACK FROM STRIPE
                    // ON THE BACK END WE SET - capture_method: 'manual' -
                    // THAT TELLS STRIPE TO ONLY AUTHORIZE THE CHARGE AND WAIT FOR US TO CAPTURE IT LATER (WITHIN 7 DAYS)
                    let paymentToken = data.paymentIntent.client_secret;

                    stripe.handleCardPayment( paymentToken, cardElement).then( result  => {

                        // IF THERE IS AN ERROR WE LOG IG AND LET THE USER KNOW
                        if (result.error) {

                            console.log("[ ERROR ]", result.error)

                            alert(result.error.message);

                            vm.paymentButtonText = "PAGAR";

                            vm.processing = false;

                        }

                        // NOW STRIPE KNOWS ABOUT OUR REQUEST AND WAITS FOR US TO CAPTURE THE CARGE
                        else {

                            console.log("[ SUCCESS ]", result)

                            let sendOrderToFirebase_config = {

                                method: 'POST' ,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(openOrder),

                            };

                            // FIFTH : WE SEND THE ORDER TO THE DATABASE
                            fetch(`${vm.firecloudAPI}/sendOrderToFirebase?customerId=${customerId}&paymentMethod=card`, sendOrderToFirebase_config);

                            // SIXTH : Send to Order Status page
                            vm.$router.push({ name: 'OrderStatus', params: { orderId: vm.openOrder.orderId } })

                        }

                    });




                    
                });


            });



        },

        computed:{

            openOrder(){

                return this.$store.state.OrderModule.openOrder;

            },

            tableNumber(){
                
                return (this.table == null) ? localStorage.getItem("tableNumber") : this.table
                

            },

        },

        methods: {


             setTableNumber(){

                 if(!this.table) return false;
                
                let openOrder = this.openOrder;

                // Random order id
                openOrder.orderId = uniqid(`T${this.table}-`);

                localStorage.setItem("tableNumber", this.table);

                this.$store.dispatch('OrderModule/setOpenOrder', openOrder)

                this.modalVisible = false;

                this.show  = true

            },
                
            updateAmount(index, acc){

                let openOrder = this.openOrder;

                if(acc == 'minus'){

                    openOrder.orderItems[index].amount >1  ? openOrder.orderItems[index].amount-- : 1

                }else{

                    openOrder.orderItems[index].amount++

                }

                this.$store.dispatch('OrderModule/setOpenOrder', openOrder)


            },


            deleteOrder(index){

                let openOrder = this.openOrder;

                openOrder.orderItems.splice(index, 1);

                // if last item in the order is deleted, erase the current order
                if(!openOrder.orderItems.length){

                    this.$store.dispatch('OrderModule/setOpenOrder', {})

                }else{

                    this.$store.dispatch('OrderModule/setOpenOrder', openOrder)

                }


            },

            onChooseCardPayment(){
                
                if(this.table == null || this.table == ""){
                    
                    this.modalVisible = true;

                }else{

                    this.show  = true
                
                }

            },

            onChooseCashPayment(){


                let comfirmation = confirm("Per pagare in contanti, dobbiamo accedere alla tua posizione per assicurare che sei presente nella nostra location.\nAssicurare che la tua Geo Localizazione sia attiva.");

                if(comfirmation){

                    let options = {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    };

                    this.processing = true;

                    this.cashPaymentText = "Processing";

                    navigator.geolocation.getCurrentPosition(this.GPS_success, this.GPS_error, options);

                }else{

                    this.cashPaymentText = "contanti";

                }

            },

            GPS_error(err) {

                this.processing = false;

                this.cashPaymentText = "contanti";

                alert(`ERROR(${err.code}): ${err.message}`);
            },

            async GPS_success(pos) {

                this.cashPaymentText = "contanti";

                let vm = this;

                let customerId = this.$route.params.restaurantId;

                let crd = pos.coords;

                this.currentLat = crd.latitude;
                this.currentLong = crd.longitude;
                this.accuracy = crd.accuracy;

                this.distance = this.getDistanceFromLatLonInKm(crd.latitude,crd.longitude, this.resLat, this.restLong);


                //CHECK IF USER IS INSIDE THE RESTAURANT RANGE ~ 30 METERS
                if(this.getDistanceFromLatLonInKm(crd.latitude,crd.longitude, this.resLat, this.restLong) <= 30){

                    // IF SO, SEND THE ORDER TO THE APP

                    // WE DONT NEED A PAYMENT INTENT ID FOR CASH PAYMENTS
                    let openOrder = vm.openOrder;
                        openOrder.paymentIntentID = false;
                        openOrder.pnToken = vm.PN_TOKEN;

                    await fetch(`${vm.firecloudAPI}/sendOrderToFirebase?customerId=${customerId}&paymentMethod=cash`, {

                        method: 'POST' ,
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(openOrder),

                    });


                    this.inrange = true;

                    this.processing = false;


                    // Send to Order Status page
                    this.$router.push({ name: 'OrderStatus', params: { orderId: this.openOrder.orderId } })

                    //this.$router.push('thank-you')


                }else{

                    // IF NOT, TELL THE USER

                    alert("Sembra che non sei present nel locale.");

                    this.modalVisibile = true;

                    this.inrange = false;

                    this.processing = false;


                }

            },

            getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {

                var R = 6371; // Radius of the earth in km
                var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
                var dLon = this.deg2rad(lon2-lon1);
                var a =
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
                ;
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                var d = R * c; // Distance in km
                return d * 1000;

            },

            deg2rad(deg) { return deg * (Math.PI/180) },

            modalOnOk(){

                this.modalVisibile = false;

            },

            modalOnCancel(){

                this.$router.push({ name: 'menu', params: { restaurantId: this.$route.params.restaurantId } })

            },


        },


    }

</script>

