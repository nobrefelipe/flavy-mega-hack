<template>

  <section class="order-status" :class="currentOrder">


    <div v-if="currentOrder == 'refused'">

      <h2>Nos desculpe</h2>

      <p style="margin-bottom: 50px">
        Seu pedido foi recusado pela equipe. Um garçom chegará o mais rápido possível para informar o motivo.
      </p>


      <button @click="$router.push({ name: 'menu', params: { restaurantId: $route.params.restaurantId } })" class="button secondary">Voltar ao menu</button>

    </div>

    <div v-if="currentOrder == 'ordered'">

      <h1>Obrigado</h1>

      <p>
        Seu pedido foi criado. Assim que for aceito, você será redirecionado para gerar um comprovante de pagamento.
      </p>

      <div class="spin">

        <a-spin />
        em espera...

      </div>

      <span><a-icon type="warning" theme="filled" /> Nāo saia dessa página</span>

    </div>


  </section>

</template>

<script>

import Vue from 'vue';
import VueFirestore from 'vue-firestore'
Vue.use(VueFirestore)
import {firestore} from '@/components/firebaseInit';

let RESTINFO =  localStorage.getItem("restaurantInfo");
    RESTINFO = JSON.parse(RESTINFO)

export default {

    name: 'OrderStatus',

    data: () =>({

        order: 'ordered'

    }),

    computed:{

        currentOrder(){

            return this.order
        }

    },

    watch: {

        currentOrder: function (val) {

          if(val){

              if(val === 'accepted'){
                  this.order = null;
                  this.$router.push(`/${RESTINFO.restaurantId}/thank-you`)
              }

              if(val === 'refused'){
                  this.$store.dispatch('OrderModule/setOpenOrder', {});
              }

          }


        }
    },

    mounted(){


        const ORDER_ID = this.$route.params.orderId

        const VM = this;

        firestore.collection('customers').doc(RESTINFO.restaurantId).onSnapshot( snapshot => {

            let orders = snapshot.data().orders;

            if (orders.length) {

                let currentOrder = orders.filter(order => {

                    return order.orderId === ORDER_ID

                });

                /*
                  BUG: ordem volta vazia assim que criada, mostrando apra o usuario a tela vermelha de ordem recusada.
                  TODO: encontrar uma maneira de evitar que a ordem volte vazia assim que criada
                  Por enquanto pode ficar assim, porque uma ordem nunca sera cancelada ou aceita em 10 segundos
                */
                setTimeout(()=>{

                  if(currentOrder.length){

                      VM.order = currentOrder[0].orderStatus;

                  }else{

                      VM.order = "refused"
                      
                  }

                }, 10000)

            }

        });

    },

}

</script>
<style lang="scss">

  .order-status{

    position: fixed;

    top:0; left:0; bottom:0; right:0;

    padding: 50px 20px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-direction: column;

    text-align: center;

    &.refused{

      background: var(--color-primary);

    }

    &.ordered{

      background: #29ab87;

    }

    h1{color: var(--color-secondary)}

    p{

      color: #fff;

      font-size: 18px;

    }


    span{

      color: #fff;

      position: absolute;

      bottom: 40px;

      left: 0;

      width: 100%;

      text-align: center;

      i{font-size: 18px}

    }

    .spin{

      display: flex;

      flex-direction: column;

      align-items: center;

      justify-content: center;

      font-size: 10px;

      color: #ededed;

      margin-top: 40px;

      .ant-spin-dot-spin{

        width: 20px;

        position: static;

        i{transform: none; background: #fff}

      }



    }

  }

</style>