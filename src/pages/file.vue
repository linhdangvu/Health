<script setup lang="ts">
  import { useRoute } from "vue-router";

  const route = useRoute();
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade-fast" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
</template>
