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
  import { useFile } from "../../stores/useFile";
  import { toApexChart, toApexChart2 } from "../../utils/apexchart";
  import sleep from "../../utils/sleep";

  /* INITIAL CONSTANT */
  // SOLDES 2022: 12/1/2022 au 8/2/2022 => 20220112 -> 20220208
  // ETE 2022: 21/6/2022 au 23/9/2022 => 20220621 - 20220923
  const START_SOLDES_HIVER: number = 20220112;
  const END_SOLDES_HIVER: number = 20220208;
  const START_ETE: number = 20220621;
  const END_ETE: number = 20220923;

  /* PROPS */
  const props = defineProps<{
    catID: number;
    data: any[];
    mag: boolean;
    annee: string;
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
  const oldAnnee = ref(props.annee);
  const optionTabs = ["Statistiques", "Top 10 magasins"];
  const currentTab = ref("Statistiques");

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
          Number(item.dateID) >= START_SOLDES_HIVER &&
          Number(item.dateID) <= END_SOLDES_HIVER
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
        if (
          item.magID &&
          props.mag &&
          Number(item.dateID) >= START_ETE &&
          Number(item.dateID) <= END_ETE
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
          text: "Top Magasin a la plus des fabricants avec lesquels coopérer",
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
          text: "Top Magasin a la plus des produits à vendre",
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
    console.log("Unmmounted");
  });

  onUpdated(async () => {
    console.log("onUpdated");
    if (Number(oldAnnee.value) !== Number(props.annee)) {
      oldAnnee.value = props.annee;
      isLoading.value = true;
      await sleep(1);
      handleData(Number(props.catID), props.annee);
      await sleep(1);
      isLoading.value = false;
    }
  });

  watchEffect(async () => {
    // console.log("Watch", Number(oldCategory.value) !== Number(props.catID));
    // console.log(optionsFab.value);
    if (Number(oldCategory.value) !== Number(props.catID)) {
      console.log("Restart by category Date");
      // console.log("watch", oldCategory.value, Number(props.catID));
      oldCategory.value = Number(props.catID);
      isLoading.value = true;
      await sleep(1);
      handleData(Number(props.catID), props.annee);
      await sleep(1);
      isLoading.value = false;
      console.log("End restart by category Date");
    }
  });
</script>

<template>
  <div class="loading" v-if="isLoading">Loading ...</div>
  <div v-else>
    <!-- <p style="text-align: left" v-if="Number(props.annee) === 2022">
      <span style="margin-left: 20px">Note: </span> <br />
      <ul> 
      <li>Soldes d'Hiver 2022: de 12/1/2022 au 8/2/2022</li>
      <li>L'Été: de 21/6/2022 au 23/9/2022</li>
      </ul>
    </p> -->
    <div v-if="props.mag">
      <div class="tabs">
        <div
          :class="[currentTab === item && 'is-active']"
          @click="currentTab = item"
          class="tab"
          v-for="item in optionTabs"
          :key="item"
        >
          {{ item }}
        </div>
      </div>

      <div v-if="currentTab === optionTabs[0]">
        <div class="box-container">
          <div class="moyenne-box" v-if="Number(props.annee) === 2022">
            <div>
              <h3>
                Moyenne dans les
                <span class="tooltip">
                  soldes d'hiver
                  <span class="tooltiptext" v-if="Number(props.annee) === 2022">
                    <p>Soldes d'Hiver 2022: de 12/1/2022 au 8/2/2022</p>
                    <p>L'Été: de 21/6/2022 au 23/9/2022</p>
                  </span>
                </span>
                {{ props.annee }}
              </h3>
              <div v-if="isLoading">Loading...</div>
              <div v-else class="box-container">
                <div class="small-box">
                  <h1>Moyenne de produits par fabricants</h1>
                  <p>{{ moyenneProduit }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="moyenne-box" v-else>
            <div class="moyenne-content">À venir ...</div>
          </div>

          <div>
            <h3>Fabricants dans Janver, Février, Mars en {{ props.annee }}</h3>
            <ApexChart
              v-if="optionsQ21"
              type="bar"
              width="500"
              :options="optionsQ21"
              :series="optionsQ21.series"
            ></ApexChart>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="Number(props.annee) === 2022">
          <h3>
            Top 10 magasins dans
            <span class="tooltip">
              l'été et les soldes d'hiver
              <span class="tooltiptext" v-if="Number(props.annee) === 2022">
                <p>Soldes d'Hiver 2022: de 12/1/2022 au 8/2/2022</p>
                <p>L'Été: de 21/6/2022 au 23/9/2022</p>
              </span>
            </span>
            en
            {{ props.annee }}
          </h3>

          <div class="box-container">
            <ApexChart
              v-if="optionsFab"
              width="500"
              type="bar"
              :options="optionsFab"
              :series="optionsFab.series"
            ></ApexChart>

            <ApexChart
              v-if="optionsProd"
              type="bar"
              width="500"
              :options="optionsProd"
              :series="optionsProd.series"
            ></ApexChart>
          </div>
        </div>

        <div v-else>
          <div class="venir">À venir</div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="box-container">
        <div class="moyenne-box" v-if="Number(props.annee) === 2022">
          <div>
            <h3>
              Moyenne dans les
              <span class="tooltip">
                soldes d'hiver
                <span class="tooltiptext" v-if="Number(props.annee) === 2022">
                  <p>Soldes d'Hiver 2022: de 12/1/2022 au 8/2/2022</p>
                  <p>L'Été: de 21/6/2022 au 23/9/2022</p>
                </span>
              </span>
              {{ props.annee }}
            </h3>
            <div v-if="isLoading">Loading...</div>
            <div v-else class="box-container">
              <div class="small-box">
                <h1>Moyenne de produits par fabricants</h1>
                <p>{{ moyenneProduit }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="moyenne-box" v-else>
          <div class="moyenne-content">À venir ...</div>
        </div>

        <div>
          <h3>Fabricants dans Janver, Février, Mars en {{ props.annee }}</h3>
          <ApexChart
            v-if="optionsQ21"
            type="bar"
            width="500"
            :options="optionsQ21"
            :series="optionsQ21.series"
          ></ApexChart>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
    .tab {
      background-color: #282626;
      color: white;
      padding: 10px 15px;
      border: solid 1px black;
      cursor: pointer;
    }

    .tab:hover,
    .is-active {
      background-color: rgba(0, 143, 251, 0.85);
      // color: black;
    }

    .tab:first-child {
      border-top-left-radius: 30px;
      border-bottom-left-radius: 30px;
    }

    .tab:nth-child(2) {
      border-top-right-radius: 30px;
      border-bottom-right-radius: 30px;
    }
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
    margin-top: 10px;

    .moyenne-box {
      width: 400px;

      .moyenne-content {
        line-height: 20rem;
      }
    }

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

  .venir {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .tooltip {
    position: relative;
    display: inline-block;
    // border-bottom: 1px dotted black;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: max-content;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
    opacity: 0;
    transition: opacity 0.3s;

    p {
      margin: 0;
    }
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }
</style>
