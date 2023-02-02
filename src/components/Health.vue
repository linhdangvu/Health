<script setup lang="ts">
  import ApexChart from "vue3-apexcharts";

  const chartOptions = {
    chart: {
      id: "vuechart-example",
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
    },
  };
  const series = [
    {
      name: "series-1",
      data: [30, 40, 35, 50, 49, 60, 70, 91],
    },
  ];
</script>

<template>
  <h3>Notification du score de santé d’un fabricant sur le marché</h3>

  <div class="container py-4 px-3 mx-auto">
    <ApexChart
      width="500"
      type="bar"
      :options="chartOptions"
      :series="series"
    ></ApexChart>
  </div>
</template>
