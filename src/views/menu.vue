<template>

  <div class="view-wrapper menu-page" id="menu-page">

    <header id="header"><logo-component /></header>

    <div class="the-menu-head" id="the-menu-head">

      <span class="restaurant-name">

        <span>

          Olá, bem-vindo ao

        </span>

        <!-- RESTAURANT NAME -->

        {{restaurantName}}

        <span style="margin-top: 10px">Mesa #{{ tableNumber }}</span>

      </span>

      <!-- CLEAR ORDER BUTTON -->
      <button v-if="openOder.orderItems" @click="clearOder" class="clear-order">Cancela ordem</button>

    </div>


    <div style="width: 100%; float: left; margin-bottom: 50px">

      <a-tabs @change="changeTab" >

        <a-tab-pane v-for="(category, index) in menuCategories" :tab="category" :key="index">

          <!-- MENU ITEMS -->
          <section class="the-menu">

            <menu-item  v-for="item in filtered_by(category)"
                        :key="item.id"
                        :data="item"/>

          </section>

        </a-tab-pane>



      </a-tabs>

    </div>




    <!-- CTA PAY NOW -->
    <div class="cta-wrapper" v-if="hasOpenOrder">

      <button class="button primary pulse" :data-price="currentAmountToPay " @click="onClickCheckout">R${{ currentAmountToPay }}<span>PAGAR</span></button>

    </div>


  </div>

</template>

<script>

  import MenuItem from "../components/MenuItem"
  import LogoComponent from "../components/LogoComponent"

  export default {

      name: 'TheMenu',

      components: { MenuItem, LogoComponent },

      data: () => ({

          activeKey: "0",
          modalVisible: true,
          table: null

      }),

      computed:{

          tableNumber(){

              return localStorage.getItem("tableNumber")

          },

          hasOpenOrder(){

              return this.$store.state.OrderModule.openOrder.orderId

          },

          currentAmountToPay(){

              return this.$store.state.OrderModule.openOrder.order_total_in_cents / 100

          },

          menuItems(){

              return this.$store.state.MenuModule.restaurantMenu;

          },

          menuCategories(){

              if(this.menuItems) return this.$store.state.MenuModule.restaurantMenuCategories;


          },

          restaurantName(){

              return this.$store.state.MenuModule.restaurantName;

          },


          openOder(){

              return  this.$store.state.OrderModule.openOrder;

          }

      },

      methods:{

        

        onClickCheckout(){
          
           this.$router.push({ name: 'orders', params: { restaurantId: this.$route.params.restaurantId } })

        },

       

        clearOder(){

            let confirmClearOder = confirm("Tem certeza que quer cancelar sua ordem?");

            if(confirmClearOder){

                this.$store.dispatch('OrderModule/setOpenOrder', {});

            }
        },

        // SET THE ACTIVE TAB TO MAKE SURE IT REMAINS ON THE LAST VISITED CATEGORY
        changeTab(tab){

            this.activeKey = tab.toString();

            localStorage.setItem('activeKey', tab.toString());

        },

        filtered_by(filter){


            let filtered = this.menuItems.filter( item => {

                return item.filter == filter

            });



            // sort by priority
            filtered =  filtered.sort(function(a, b){
                if(a.priority < b.priority) { return -1; }
                if(a.priority > b.priority) { return 1; }
                return 0;
            })

            return filtered

        },


      },

      mounted(){

          let vm = this;

          // SET THE ACTIVE TAB TO MAKE SURE IT REMAINS ON THE LAST VISITED CATEGORY
          this.activeKey = localStorage.getItem('activeKey') || "0";

          //Make sure we always have the menu
          if(!this.menuItems){

              this.$store.dispatch('MenuModule/getMenu', this.$route.params.restaurantId)

                  .then( () => {

                      vm.loading = false

                  });

          }



          /*

              ADD CLASS TO HEADER AFTER SCROLL

          */
          let scrollpos = window.scrollY;

          const header = document.getElementById("menu-page");

          const add_class_on_scroll = () => header.classList.add("stick");

          const remove_class_on_scroll = () => header.classList.remove("stick");

          window.addEventListener('scroll', function() {

              scrollpos = window.scrollY;

              if (scrollpos >= 50) { add_class_on_scroll() }

              else { remove_class_on_scroll() }

          })



      }


  }

</script>

<style lang="scss">


  .pulse{

    position: relative;

    &:before,
    &:after{

      position: absolute;

      top:-25px; left: 25%;

      z-index: 10;

      content: "";

      width: 100px;

      height: 100px;

      background: rgba(0,0,0,0.2);

      border-radius: 50px;

      transform: scale(0);

      animation-duration: 1s;

      animation-timing-function: ease;

      animation-name: pulse;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 90px;
    }

    &:before{

      animation-delay: .5s;

      content: attr(data-price);

    }

  }


  @keyframes pulse {

    from{  transform: scale(0);}
    to{ opacity: 0;  transform: scale(1);}

  }


</style>