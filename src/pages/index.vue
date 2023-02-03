<template>
  <h3>Choisir la façon de récupérer des données</h3>
  <div class="buttons">
    <RouterLink :to="{ name: 'api' }">
      <button class="btn">API</button>
    </RouterLink>
    <RouterLink :to="{ name: 'file' }">
      <button class="btn">File</button>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
  .buttons {
    .btn {
      margin: 10px;
    }

    .btn:hover {
      background-color: white;
      color: black;
      border-color: black;
    }
  }
</style>
