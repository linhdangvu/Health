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
  let topMagasinByFab: any[] = [];
  let topMagasinByProd: any[] = [];

  const file = useFile();

  const changeDataShow = async (val: string) => {
    // console.log(val);
    dataToShow.value = val;
    await handleCategory(5);
  };

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

  const handleCategory = async (category: number) => {
    isLoading.value = true;
    console.log("Loading...");
    try {
      const data = await file.getFileData(dataToShow.value);
      const fabData: any[] = [];
      const prodData: any[] = [];
      const magData: any[] = [];
      const prodByFab: any[] = [];
      const topMagasin: any = {};
      data.forEach((item: any) => {
        if (Number(item.catID) === category) {
          // Questin 1.1
          if (!fabData.includes(item.fabID)) {
            fabData.push(item.fabID);
          } else {
            // • Question 1.2.
            if (!prodByFab.includes(item.prodID)) {
              prodByFab.push(item.prodID);
            }
          }

          if (!prodData.includes(item.prodID)) {
            prodData.push(item.prodID);
          }
          if (item.magID) {
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
      console.log("Moyenne: " + prodByFab.length / fabData.length);

      nombreFab.value = fabData.length;
      nombreProd.value = prodData.length;
      nombreMag.value = magData.length;
      moyenneProduit.value =
        Math.round((prodByFab.length / fabData.length) * 100) / 100;
      // console.log(topMagasin);

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
      console.log(fabSorted);
      console.log(prodSorted);
      topMagasinByFab = fabSorted.slice(0, 10);
      topMagasinByProd = prodSorted.slice(0, 10);
      console.log("End loading...");
      isLoading.value = false;
    } catch (e) {
      console.log(e);
    }
  };

  // console.dir(prodByFabs, { depth: null });

  await handleCategory(5);

  const toApexChart = (data: any[]) => {
    return data.map((item: any) => {
      const key: any = Object.keys(item).pop();
      return { x: key, y: item[key] };
    });
  };

  console.log(toApexChart(topMagasinByFab));

  const optionsFab = {
    chart: {
      type: "bar",
    },
    title: {
      text: "Top Magasin a la plupart des fabricants avec lesquels coopérer",
      align: "center",
    },
    series: [
      {
        data: toApexChart(topMagasinByFab),
      },
    ],
  };

  const optionsProd = {
    chart: {
      type: "bar",
    },
    title: {
      text: "Top Magasin a la plupart des produits à vendre",
      align: "center",
    },
    series: [
      {
        data: toApexChart(topMagasinByProd),
      },
    ],
  };

  watchEffect(() => {
    console.log(topMagasinByFab);
    console.log(topMagasinByProd);
  });
</script>

<template>
  <h3>Notification du score de santé d’un fabricant sur le marché</h3>

  <p>Category 5</p>

  <div v-if="isLoading">Loading page...</div>
  <div v-else>
    <div class="buttons">
      <button
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

    <h3>Nombre total</h3>
    <div v-if="isLoading">Loading...</div>
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
    <div v-if="isLoading">Loading...</div>
    <div v-else class="box-container">
      <div class="small-box">
        <h1>Moyenne de produits par fabricants</h1>
        <p>{{ moyenneProduit }}</p>
      </div>
    </div>

    <h3>Top 10</h3>

    <div class="box-container">
      <ApexChart
        width="500"
        type="bar"
        :options="optionsFab"
        :series="optionsFab.series"
      ></ApexChart>

      <ApexChart
        type="bar"
        width="500"
        :options="optionsProd"
        :series="optionsProd.series"
      ></ApexChart>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    button {
      margin: 10px;
    }

    .is-active {
      border: solid 2px lightblue;
      background-color: rgb(88, 191, 255);
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
