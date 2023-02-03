<script setup lang="ts">
  import { anyTypeAnnotation } from "@babel/types";
  import axios from "axios";
  import {
    computed,
    onMounted,
    onUpdated,
    reactive,
    ref,
    watchEffect,
  } from "vue";
  import ApexChart from "vue3-apexcharts";
  import { useFile } from "../stores/useFile";
  import { toApexChart, toApexChart2 } from "../utils/apexchart";
  import sleep from "../utils/sleep";
  import { addArray, clearArray } from "../utils/useArray";

  /* PROPS */
  const props = defineProps<{
    catID: number;
    data: any[];
    mag: boolean;
  }>();

  console.log(props.mag);

  /* INITIAL VARIABLE */
  const nombreFab = ref(0);
  const nombreProd = ref(0);
  const nombreMag = ref(0);
  const isLoading = ref(true);
  const isLoadingMoyen = ref(true);
  const moyenneProduit = ref(0);
  const moyenneProdTop1 = ref(0);
  const moyenneProdTop2 = ref(0);
  const loadingChart = ref(false);
  let topMagasinByFab: any[] = [];
  let topMagasinByProd: any[] = [];
  const fabData: any[] = [];
  const prodData: any[] = [];
  const magData: any[] = [];
  const prodByFab: any[] = [];
  let topMagasin: any = {};
  const dateData: any[] = [];
  const chartTopFab = reactive<any[]>([]);
  const checkFabID = ref(965);
  const oldCategory = ref(props.catID);
  const dateString = [
    "Janvier 2022",
    "Février 2022",
    "Mars 2022",
    "Avril 2022",
    "Mai 2022",
    "Juin 2022",
    "Juillet 2022",
    "Août 2022",
    "Septembre 2022",
    "Octobre 2022",
    "Novembre 2022",
    "Decembre 2022",
    "Janvier 2023",
  ];

  const fabricantSorted = (data: any) => {
    if (!data) return [];
    const sortedData: any = data.sort((obj1: any, obj2: any) => {
      if (Number(obj1.fab) > Number(obj2.fab)) {
        return 1;
      }
      if (Number(obj1.fab) < Number(obj2.fab)) {
        return -1;
      }
      return 0;
    });
    return sortedData;
  };

  const productSorted = (data: any) => {
    if (!data) return [];
    const sortedData: any = data.sort((obj1: any, obj2: any) => {
      if (Number(obj1.prod) > Number(obj2.prod)) {
        return 1;
      }
      if (Number(obj1.prod) < Number(obj2.prod)) {
        return -1;
      }
      return 0;
    });
    return sortedData;
  };
  const handleData = (category: number) => {
    topMagasin = {};
    props.data.forEach((item: any) => {
      // console.log("Run");
      if (Number(item.catID) === category) {
        if (!fabData.includes(item.fabID)) {
          // Questin 1.1
          fabData.push(item.fabID);
        } else {
          // • Question 1.2.
          if (!prodByFab.includes(item.prodID)) {
            prodByFab.push(item.prodID);
          }
        }
        // • Question 1.1.
        if (!prodData.includes(item.prodID)) {
          prodData.push(item.prodID);
        }
        // • Question 1.3.
        if (item.magID && props.mag) {
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

      if (!dateData.includes(Number(item.dateID.slice(0, 6)))) {
        dateData.push(Number(item.dateID.slice(0, 6)));
      }

      dateData.sort((a: any, b: any) => a - b);
    });
    console.log(dateData);
    // Question 1.1
    nombreFab.value = fabData.length;
    nombreProd.value = prodData.length;
    nombreMag.value = magData.length;

    // Question 1.2
    moyenneProduit.value =
      Math.round((prodByFab.length / fabData.length) * 100) / 100;
    // console.log(topMagasin);
    if (props.mag) {
      // FOR question 3

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

      topMagasinByFab = fabSorted.slice(0, 10);
      topMagasinByProd = prodSorted.slice(0, 10);
      console.log(topMagasinByFab);
      console.log(topMagasin);
      // Question 1.4
      // Pose fabID = 506, catID = 5, magasin top 10

      handleFab(checkFabID.value, category, topMagasinByFab, topMagasinByProd);
    }
  };

  const handleFab = (
    fab: number,
    category: number,
    topMagasinByFab: any[],
    topMagasinByProd: any[]
  ) => {
    console.log("Start Fab", topMagasinByFab, topMagasinByProd);
    // Question 1.4
    // Pose fabID = 506, catID = 5, magasin top 10
    const list10MagFab = topMagasinByFab.map((ele: any) => {
      return Object.keys(ele).pop();
    });
    const list10MagProd = topMagasinByProd.map((ele: any) => {
      return Object.keys(ele).pop();
    });

    const filteredProductByFabTop: any[] = [];
    const filteredProductByProdTop: any[] = [];
    const chartFab: any[] = [];
    console.log(props.data.length);
    props.data.forEach((item: any) => {
      if (
        Number(item.catID) === Number(category) &&
        Number(item.fabID) === Number(checkFabID.value)
      ) {
        if (
          !filteredProductByFabTop.includes(item.prodID) &&
          list10MagFab.includes(item.magID)
        ) {
          filteredProductByFabTop.push(item.prodID);
          console.log("FAB", item);

          // Janvier
          dateData.forEach((i2: any, index: number) => {
            if (!chartFab[index]) chartFab[index] = 0;
            if (Number(item.dateID.slice(0, 6)) === Number(i2)) {
              if (chartFab[index] !== 0) {
                const n = chartFab[index];
                chartFab[index] = (n + 1 / 10) * 100;
              } else {
                chartFab[index] = (1 / 10) * 100;
              }
            }
          });
        }

        if (
          !filteredProductByProdTop.includes(item.prodID) &&
          list10MagProd.includes(item.magID)
        ) {
          filteredProductByProdTop.push(item.prodID);
          // console.log("PROD", item);
        }
        // if (Number(item.catID) === props.catID && Number(item.magID) === 22) {
        //   console.log(item.fabID);
        // }
      }
    });
    console.log(chartFab);
    clearArray(chartTopFab);
    addArray(chartTopFab, chartFab);
    // console.log(filteredProductByFabTop, filteredProductByProdTop);
    moyenneProdTop1.value = (filteredProductByFabTop.length / 10) * 100;
    moyenneProdTop2.value = (filteredProductByProdTop.length / 10) * 100;

    console.log("End Fab");
  };

  const handleCount = async () => {
    loadingChart.value = true;
    await sleep(1);
    handleFab(checkFabID.value, props.catID, topMagasinByFab, topMagasinByProd);
    await sleep(1);
    loadingChart.value = false;
  };

  onMounted(() => {
    isLoading.value = true;
    console.log("Loading...");
    try {
      handleData(Number(props.catID));
      isLoading.value = false;
      console.log("End loading...");
    } catch (e: any) {
      console.log(e);
    }
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

  const optionsMoyProd1 = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          height: 350,
          type: "radialBar",
        },
        series: [moyenneProdTop1.value],
        labels: ["Fabricants"],
      };
    }
    return undefined;
  });

  const optionsMoyProd2 = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          height: 350,
          type: "radialBar",
        },
        series: [moyenneProdTop2.value],
        labels: ["Produits"],
      };
    }
    return undefined;
  });

  const optionsTopFab = computed(() => {
    if (!isLoading.value) {
      return {
        chart: {
          type: "bar",
        },
        title: {
          text: "Moyenne de produits par mois",
          align: "center",
        },
        series: [
          {
            name: "Moyenne de produits",
            data: toApexChart2(dateString, chartTopFab),
          },
        ],
      };
    }
    return undefined;
  });

  watchEffect(async () => {
    console.log("Watch", checkFabID);
    if (Number(oldCategory.value !== Number(props.catID))) {
      console.log("Restart by category");
      oldCategory.value = Number(props.catID);
      isLoading.value = true;
      await sleep(1);
      handleData(Number(props.catID));
      await sleep(1);
      isLoading.value = false;
      console.log("End restart by category");
    }

    if (!isLoading.value) {
      console.log(toApexChart2(dateData, chartTopFab));
    }
  });
</script>

<template>
  <div class="loading" v-if="isLoading">Loading ...</div>
  <div v-else>
    <h3>Nombre total</h3>
    <div v-if="isLoading">Loading container...</div>
    <div v-else class="box-container">
      <div class="small-box">
        <h1>Nombre de fabricants</h1>
        <p>{{ nombreFab }}</p>
      </div>

      <div class="small-box">
        <h1>Nombre de produits</h1>
        <p>{{ nombreProd }}</p>
      </div>

      <div v-if="nombreMag !== 0" class="small-box">
        <h1>Nombre de magasins</h1>
        <p>{{ nombreMag }}</p>
      </div>
    </div>

    <h3>Moyenne</h3>
    <div v-if="isLoading">Loading container...</div>
    <div v-else class="box-container">
      <div class="small-box">
        <h1>Moyenne de produits par fabricants</h1>
        <p>{{ moyenneProduit }}</p>
      </div>
    </div>

    <div v-if="props.mag">
      <h3>Top 10 magasins</h3>

      <div class="box-container">
        <ApexChart
          v-if="optionsFab && props.mag"
          width="500"
          type="bar"
          :options="optionsFab"
          :series="optionsFab.series"
        ></ApexChart>

        <ApexChart
          v-if="optionsProd && props.mag"
          type="bar"
          width="500"
          :options="optionsProd"
          :series="optionsProd.series"
        ></ApexChart>
      </div>

      <h3>Moyenne de produits by fabricants dans top 10 magasins</h3>
      <!-- pour calculer la moyenne de produits -->
      <p>
        Entrer la fabricants:
        <input class="fab-input" type="number" v-model="checkFabID" />
        <button class="fab-btn" @click="handleCount">Compter</button>
      </p>
      <div v-if="loadingChart">Loading chart ...</div>
      <div v-else>
        <div class="box-container">
          <ApexChart
            v-if="optionsMoyProd1 && props.mag"
            :type="optionsMoyProd1.chart.type"
            :height="optionsMoyProd1.chart.height"
            :options="optionsMoyProd1"
            :series="optionsMoyProd1.series"
          ></ApexChart>

          <ApexChart
            v-if="optionsMoyProd2 && props.mag"
            :type="optionsMoyProd2.chart.type"
            :height="optionsMoyProd2.chart.height"
            :options="optionsMoyProd2"
            :series="optionsMoyProd2.series"
          ></ApexChart>
        </div>

        <div class="box-container">
          <ApexChart
            v-if="optionsTopFab"
            type="bar"
            width="500"
            :options="optionsTopFab"
            :series="optionsTopFab.series"
          ></ApexChart>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .fab-input {
    height: 20px;
    font-size: 1rem;
    text-align: center;
    width: 80px;
    padding: 5px;
  }

  .fab-btn {
    margin-left: 10px;
    padding: 5px;
    color: black;
    background-color: white;
    border: solid 1px black;
  }

  .fab-btn:hover {
    margin-left: 10px;
    padding: 5px;
    color: white;
    background-color: black;
    border: solid 1px black;
  }

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
