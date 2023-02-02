<script setup lang="ts">
  import { ref } from "vue";

  const question = ref("q2");
</script>

<template>
  <h3>Notification du score de santé d’un fabricant sur le marché</h3>
  <p>Category 5</p>
  <div class="buttons">
    <h4>Choisir la question:</h4>
    <button
      class="btn-white"
      :class="[question === `q1` && 'is-active']"
      @click="question = `q1`"
    >
      Question 1
    </button>
    <button
      class="btn-white"
      :class="[question === `q2` && 'is-active']"
      @click="question = `q2`"
    >
      Question 2
    </button>
  </div>

  <Health v-if="question === `q1`" />
  <HeathDate v-if="question === `q2`" />
</template>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .btn-white {
      margin: 10px;
      color: black;
      background-color: whitesmoke;
      border: solid 1px black;
    }

    .is-active {
      // border: solid 2px lightblue;
      background-color: rgb(0, 0, 0);
      color: white;
    }
  }
</style>
