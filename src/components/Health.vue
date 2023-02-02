<script setup lang="ts">
  import axios from "axios";
  import ApexChart from "vue3-apexcharts";
  import { useFile } from "../stores/useFile";

  const file = useFile();
  const data = await file.getFileData(
    "/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/produits-tous"
  );
  console.log(data);
</script>

<template>
  <h3>Notification du score de santé d’un fabricant sur le marché</h3>

  <div class="container py-4 px-3 mx-auto">
    <!-- <ApexChart
      width="500"
      type="bar"
      :options="chartOptions"
      :series="series"
    ></ApexChart> -->
  </div>
</template>
