<script setup lang="ts">
  import { anyTypeAnnotation } from "@babel/types";
  import axios from "axios";
  import { AnyNsRecord } from "dns";
  import { computed, onUpdated, reactive, ref, watchEffect } from "vue";
  import ApexChart from "vue3-apexcharts";
  import { useFile } from "../stores/useFile";
  import sleep from "../utils/sleep";

  /* INITIAL VARIABLE */
  const dataToShow = ref(
    "/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/pointsDeVente-tous"
  );
  const nombreFab = ref(0);
  const nombreProd = ref(0);
  const nombreMag = ref(0);
  const isLoading = ref(true);
  const isLoadingMoyen = ref(true);
  const moyenneProduit = ref(0);
  const moyenneProdTop1 = ref(0);
  const moyenneProdTop2 = ref(0);
  let topMagasinByFab: any[] = [];
  let topMagasinByProd: any[] = [];
  let nbFab3Mois: any[] = [];

  const file = useFile();

  const changeDataShow = async (val: string) => {
    // console.log(val);
    dataToShow.value = val;
    await handleCategory(5);
  };

  //   12/1/2022 au  8/2/2022 => 20220112 -> 20220208
  const startSoldesHiver = 20220112;
  const endSoldesHiver = 20220208;

  const handleCategory = async (category: number) => {
    isLoading.value = true;
    console.log("Loading...");
    try {
      const data = await file.getFileData(dataToShow.value);
      const nbFabJan: any[] = [];
      const nbFabFeb: any[] = [];
      const nbFabMars: any[] = [];
      console.log(Number(data[0].dateID.slice(4, 6)) === 1);

      data.forEach((item: any) => {
        if (Number(item.catID) === category) {
          // Question 2.1: Pour la catégorie d’identifiant 5, combien y a t il d’acteurs sur le
          // marché ayant un produit de cette catégorie en Janvier, en Février, et en Mars?

          if (
            Number(item.dateID.slice(0, 4)) === 2022 &&
            Number(item.dateID.slice(4, 6)) === 1 &&
            !nbFabJan.includes(item.fabID)
          ) {
            nbFabJan.push(item.fabID);
          }

          if (
            Number(item.dateID.slice(0, 4)) === 2022 &&
            Number(item.dateID.slice(4, 6)) === 2 &&
            !nbFabFeb.includes(item.fabID)
          ) {
            nbFabFeb.push(item.fabID);
          }

          if (
            Number(item.dateID.slice(0, 4)) === 2022 &&
            Number(item.dateID.slice(4, 6)) === 3 &&
            !nbFabMars.includes(item.fabID)
          ) {
            nbFabMars.push(item.fabID);
          }
        }
      });
      nbFab3Mois = [nbFabJan.length, nbFabFeb.length, nbFabMars.length];
      //   console.log(nbFabJan);
      console.log("End loading...");
      isLoading.value = false;
    } catch (e) {
      console.log(e);
    }
  };

  // console.dir(prodByFabs, { depth: null });

  await handleCategory(5);

  const toApexChart = (data1: any[], data2: any[]) => {
    return data1.map((item: any, index: number) => {
      console.log(item);
      return { x: item, y: data2[index] };
    });
  };

  const optionsQ21 = {
    chart: {
      type: "bar",
    },
    title: {
      text: "Nombre de fabricants 2022",
      align: "center",
    },
    series: [
      {
        name: "Fabricants",
        data: toApexChart(["Janvier", "Février", "Mars"], nbFab3Mois),
      },
    ],
  };

  watchEffect(() => {});
</script>

<template>
  <div v-if="isLoading">Loading page...</div>
  <div v-else>
    <div class="buttons">
      <h4>Choisir les données:</h4>
      <button
        class="btn-lightblue"
        :class="dataToShow.includes('pointsDeVente-tous') ? 'is-active' : ''"
        @click="
          changeDataShow(
            `/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/pointsDeVente-tous`
          )
        "
      >
        Points de vente
      </button>

      <button
        class="btn-lightblue"
        :class="dataToShow.includes('produits-tous') ? 'is-active' : ''"
        @click="
          changeDataShow(
            `/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/produits-tous`
          )
        "
      >
        Produit
      </button>
    </div>

    <h3></h3>

    <div class="box-container">
      <ApexChart
        type="bar"
        width="500"
        :options="optionsQ21"
        :series="optionsQ21.series"
      ></ApexChart>

      <!--  <ApexChart
        :type="optionsMoyProd2.chart.type"
        :height="optionsMoyProd2.chart.height"
        :options="optionsMoyProd2"
        :series="optionsMoyProd2.series"
      ></ApexChart> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .btn-lightblue {
      margin: 10px;
      color: black;
      background-color: rgb(213, 234, 246);
      border: solid 1px black;
    }

    .is-active {
      // border: solid 2px lightblue;
      background-color: rgb(0, 157, 255);
      color: white;
    }
  }

  .box-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .small-box {
      border: solid 2px black;
      box-shadow: 0 1px whitesmoke;
      padding: 10px;
      margin: 10px;
      width: max-content;

      h1 {
        font-size: 1rem;
      }

      h1,
      p {
        margin: 0;
      }
    }
  }
</style>
