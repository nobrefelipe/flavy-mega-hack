<template>

  <div class="view-wrapper welcome" :class="{ready: !loading}" >


    <logo-component></logo-component>

    <a-icon type="loading" class="loading" v-if="loading" style="margin-top: -62px; color: #fff; z-index: 999;"/>


    <div class="slogan">

      <h2>ESCOLHA</h2>
      <h2>ORDENE</h2>
      <h2>PAGUE</h2>

    </div>

  </div>

</template>

<script>

  import LogoComponent from "../components/LogoComponent";

export default {

    name: 'welcome',

    components: { LogoComponent },

    data: () => ({

        loading: true,

        error: false,

    }),



    /*
      Esperamos nosos store pegar o menu do restaurante pelo ID
      quando termina redirecionamos para a pagina do menu
    */
    mounted(){

        let vm = this;

        this.$store.dispatch('MenuModule/getMenu', this.$route.params.restaurantId)

            .then( () => {

                vm.loading = false;

                vm.$router.push({ name: 'menu', params: { restaurantId: this.$route.params.restaurantId } })

            });


    },


}

</script>
