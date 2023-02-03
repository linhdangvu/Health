<script setup lang="ts">
  import { anyTypeAnnotation } from "@babel/types";
  import axios from "axios";
  import { AnyNsRecord } from "dns";
  import {
    computed,
    onMounted,
    onUnmounted,
    onUpdated,
    reactive,
    ref,
    watchEffect,
  } from "vue";
  import ApexChart from "vue3-apexcharts";
  import { useFile } from "../stores/useFile";
import { toApexChart, toApexChart2 } from "../utils/apexchart";
  import sleep from "../utils/sleep";

  /* PROPS */
  const props = defineProps<{
    catID: number;
    data: any[];
    mag: boolean;
    annee: string
  }>();

  /* INITIAL VARIABLE */
  const isLoading = ref(true);
  const moyenneProduit = ref(0);
  const fabData: any[] = [];
  const prodData: any[] = [];
  const magData: any[] = [];
  const prodByFab: any[] = [];
  let topMagasin: any = {};
  let nbFab3Mois: any[] = [];
  let topMagasinByFab: any[] = [];
  let topMagasinByProd: any[] = [];
  const oldCategory = ref(props.catID);
  const oldAnnee = ref(props.annee)

  //   12/1/2022 au  8/2/2022 => 20220112 -> 20220208
  const startSoldesHiver = 20220112;
  const endSoldesHiver = 20220208;

  const handleData = (category: number, annee: string) => {
    const nbFabJan: any[] = [];
    const nbFabFeb: any[] = [];
    const nbFabMars: any[] = [];
    const fabData: any[] = [];
    const prodByFab: any[] = [];
    const magData: any[] = [];
    const topMagasin: any = {};

    props.data.forEach((item: any) => {
      if (
        Number(item.catID) === category &&
        Number(item.dateID.slice(0, 4)) === Number(annee)
      ) {
        // Question 2.1: Pour la catégorie d’identifiant 5, combien y a t il d’acteurs sur le
        // marché ayant un produit de cette catégorie en Janvier, en Février, et en Mars?
        if (
          Number(item.dateID.slice(4, 6)) === 1 &&
          !nbFabJan.includes(item.fabID)
        ) {
          nbFabJan.push(item.fabID);
        }

        if (
          Number(item.dateID.slice(4, 6)) === 2 &&
          !nbFabFeb.includes(item.fabID)
        ) {
          nbFabFeb.push(item.fabID);
        }

        if (
          Number(item.dateID.slice(4, 6)) === 3 &&
          !nbFabMars.includes(item.fabID)
        ) {
          nbFabMars.push(item.fabID);
        }

        // Question 2.2:
        if (
          Number(item.dateID) >= 20220112 &&
          Number(item.dateID) <= 20220208
        ) {
          if (!fabData.includes(item.fabID)) {
            // Questin 1.1
            fabData.push(item.fabID);
          } else {
            // • Question 1.2.
            if (!prodByFab.includes(item.prodID)) {
              prodByFab.push(item.prodID);
            }
          }
        }

        // • Question 2.3.
        // ETE 2022: 21/6/2022 - 23/9/2022 => 20220621 - 20220923
        if (
          item.magID && props.mag &&
          Number(item.dateID) >= 20220621 &&
          Number(item.dateID) <= 20220923
        ) {
          // TOP 10 magasin: most pid, most fid
          if (!magData.includes(item.magID)) {
            magData.push(item.magID);
          } else {
            if (topMagasin[item.magID]) {
              let dataF = topMagasin[item.magID].fab;
              let dataP = topMagasin[item.magID].prod;
              if (!dataF.includes(item.fabID)) {
                dataF.push(item.fabID);
              }
              if (!dataP.includes(item.prodID)) {
                dataP.push(item.prodID);
              }
              topMagasin[item.magID] = { fab: dataF, prod: dataP };
            } else {
              topMagasin[item.magID] = {
                fab: [item.fabID],
                prod: [item.prodID],
              };
            }
          }
        }
      }
    });

    //Q2.1
    nbFab3Mois = [nbFabJan.length, nbFabFeb.length, nbFabMars.length];

    //Q2.2
    moyenneProduit.value =
      Math.round((prodByFab.length / fabData.length) * 100) / 100;

      if (props.mag) {
         //Q2.3
    // Sorted top magasion
    const toFabMagasin = Object.keys(topMagasin).map((item: any) => {
      const lenF = topMagasin[item].fab.length;
      const obj: any = {};
      obj[item] = lenF;
      return obj;
    });

    const toProdMagasin = Object.keys(topMagasin).map((item: any) => {
      const lenP = topMagasin[item].prod.length;
      const obj: any = {};
      obj[item] = lenP;
      return obj;
    });

    const fabSorted = toFabMagasin.sort(
      (a: any, b: any) =>
        Number(Object.values(b).pop()) - Number(Object.values(a).pop())
    );

    // await sleep(100);
    const prodSorted = toProdMagasin.sort(
      (a: any, b: any) =>
        Number(Object.values(b).pop()) - Number(Object.values(a).pop())
    );
    // console.log(toNumberMagasin);
    topMagasinByFab = fabSorted.slice(0, 10);
    topMagasinByProd = prodSorted.slice(0, 10);

    // END Q2.3
      }
  };

  onMounted(() => {
    isLoading.value = true;
    console.log("Loading...");
    try {
      handleData(Number(props.catID), props.annee);
      console.log("End loading...");
      isLoading.value = false;
    } catch (e) {
      console.log(e);
    }
  });



  const optionsQ21 = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          type: "bar",
        },
        title: {
          text: "Nombre de fabricants " + props.annee,
          align: "center",
        },
        series: [
          {
            name: "Fabricants",
            data: toApexChart2(["Janvier", "Février", "Mars"], nbFab3Mois),
          },
        ],
      };
    }
    return undefined;
  });

  const optionsFab = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          type: "bar",
        },
        title: {
          text: "Top Magasin a la plupart des fabricants avec lesquels coopérer",
          align: "center",
        },
        series: [
          {
            name: "Fabricants",
            data: toApexChart(topMagasinByFab),
          },
        ],
      };
    }
    return undefined;
  });

  const optionsProd = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          type: "bar",
        },
        title: {
          text: "Top Magasin a la plupart des produits à vendre",
          align: "center",
        },
        series: [
          {
            name: "Produits",
            data: toApexChart(topMagasinByProd),
          },
        ],
      };
    }
    return undefined;
  });

  onUnmounted(() => {
    console.log("Unmmounted")
  })

  onUpdated(async () => {
    console.log('onUpdated')
    if (Number(oldAnnee.value) !== Number(props.annee)) {
      oldAnnee.value = props.annee;
      isLoading.value = true;
      await sleep(1);
      handleData(Number(props.catID),props.annee);
      await sleep(1);
      isLoading.value = false;
    }
    
  })
  
  watchEffect(async () => {
    console.log('Watch', Number(oldCategory.value) !== Number(props.catID) )
    console.log(optionsFab.value)
    if (Number(oldCategory.value) !== Number(props.catID)) {
      console.log("Restart by category Date");
      console.log("watch",oldCategory.value, Number(props.catID) )
      oldCategory.value = Number(props.catID);
      isLoading.value = true;
      await sleep(1);
      handleData(Number(props.catID),props.annee);
      await sleep(1);
      isLoading.value = false;
      console.log("End restart by category Date");
    } else {
      
      console.log("Not in the same value");
    }
  });
</script>

<template>
  <div class="loading" v-if="isLoading">Loading ...</div>
  <div v-else>
    <p style="text-align: left" v-if="Number(props.annee) === 2022">
      <span style="margin-left: 20px">Note: </span> <br />
      <ul> 
      <li>Soldes d'Hiver 2022: de 12/1/2022 au 8/2/2022</li>
      <li>L'Été: de 21/6/2022 au 23/9/2022</li>
      </ul>
    </p>

    <h3>Fabricants dans Janver, Février, Mars en {{ props.annee }}</h3>

    <div class="box-container">
      <ApexChart
        v-if="optionsQ21"
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
<div  v-if="Number(props.annee) === 2022">
  <h3>Moyenne dans les soldes d'hiver 2022</h3>
    <div v-if="isLoading">Loading...</div>
    <div v-else class="box-container">
      <div class="small-box">
        <h1>Moyenne de produits par fabricants</h1>
        <p>{{ moyenneProduit }}</p>
      </div>
    </div>

    <h3>Top 10 magasins dans l'été et les soldes d'hiver en 2022</h3>
    <!-- <h3>Top 10 magasins ont la plupart fabricants</h3> -->

    <div class="box-container">
      <ApexChart
        v-if="optionsFab"
        width="500"
        type="bar"
        :options="optionsFab"
        :series="optionsFab.series"
      ></ApexChart>

      <!-- <ApexChart
    :type="optionsMoyProd1.chart.type"
    :height="optionsMoyProd1.chart.height"
    :options="optionsMoyProd1"
    :series="optionsMoyProd1.series"
  ></ApexChart> -->
    </div>

    <!-- <h3>Top 10 magasins ont la plupart produits</h3> -->

    <div class="box-container">
      <ApexChart
        v-if="optionsProd"
        type="bar"
        width="500"
        :options="optionsProd"
        :series="optionsProd.series"
      ></ApexChart>

      <!-- <ApexChart
    :type="optionsMoyProd2.chart.type"
    :height="optionsMoyProd2.chart.height"
    :options="optionsMoyProd2"
    :series="optionsMoyProd2.series"
  ></ApexChart> -->
    </div>
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

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>
