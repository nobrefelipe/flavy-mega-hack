<template>

  <div id="app">

    <main>

      <transition :name="transitionName">

        <router-view :key="$route.name"/>

      </transition>

    </main>

  </div>

</template>

<script>

  export  default {

      data : () => ({

          transitionName: ''

      }),

      watch: {
          $route(to, from) {
              this.transitionName = to.meta.page > from.meta.page ? "faded" : "faded";
          }
      },

      methods: {
          debug(e) {
              console.log(e)
          },

      },

  }

</script>

<style lang="scss" src="./assets/scss/styles.scss"></style>