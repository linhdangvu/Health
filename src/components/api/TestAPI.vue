<script setup lang="ts">
  import { useAPI } from "../../../src/stores/useAPI";

  const URL_PRODUIT = "http://51.255.166.155:1353/logProduits/";
  const URL_VENTE = "http://51.255.166.155:1353/logAccordsVente/";

  const api = await useAPI();

  const data = api.getDataRange("/vente", 1, 160000);
  console.log(data);
</script>

<template>
  <h1>Test api</h1>
</template>
