<script setup lang="ts">
  import { computed, onMounted, onUpdated, ref, watchEffect } from "vue";
  import { useFile } from "../../stores/useFile";
  import sleep from "../../../src/utils/sleep";

  /* INITIAL VARIABLE */
  const question = ref("q2");
  const category = ref(5);
  const annee = ref("Tous les années");
  const dataToShow = ref(
    "/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/pointsDeVente-tous"
  );
  const oldFile = ref(dataToShow.value);
  const oldCategory = ref(category.value);
  const oldAnnee = ref(annee.value);

  const isLoading = ref(true);
  const file = useFile();
  let data: any = [];
  const categoryData: any[] = [];

  const anneeOptions = ["Tous les années", "2022", "2023"];
  const fileOptions = [
    {
      label: "Points De Vente",
      value:
        "/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/pointsDeVente-tous",
    },
    {
      label: "Produit",
      value:
        "/Volumes/Bi DANG/CFAINSTA/Codespace/IA/health/src/data/produits-tous",
    },
  ];

  /* FUNCTION */
  onMounted(async () => {
    isLoading.value = true;
    await handleFile();
    data.forEach((item: any) => {
      if (!categoryData.includes(item.catID)) categoryData.push(item.catID);
    });
    categoryData.sort((a: number, b: number) => a - b);
    isLoading.value = false;
  });

  const handleFile = async () => {
    try {
      data = await file.getFileData(dataToShow.value);
    } catch (e: any) {
      console.log(e);
    }
  };

  const changeDataShow = async (val: string) => {
    // console.log(val);
    dataToShow.value = val;
  };

  const allData = computed(() => {
    if (!isLoading.value) {
      return data;
    }
    return [];
  });

  onUpdated(async () => {
    if (oldFile.value !== dataToShow.value) {
      // console.log(oldFile.value, dataToShow.value);

      oldFile.value = dataToShow.value;

      isLoading.value = true;
      await sleep(1);
      await handleFile();
      await sleep(1);
      isLoading.value = false;
    }
  });
</script>

<template>
  <h2>Notification du score de santé d’un fabricant sur le marché</h2>
  <div class="loading" v-if="isLoading">Loading...</div>
  <div v-else>
    <div class="box-select-container">
      <div class="box-select">
        <h2 class="title">Choisir les données</h2>
        <select class="select" v-model="dataToShow">
          <option
            v-for="item in fileOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="box-select">
        <h2 class="title">Choisir la catégorie</h2>
        <select
          class="select"
          v-model="category"
          v-if="categoryData.length !== 0"
        >
          <option v-for="item in categoryData" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>

      <div class="box-select">
        <h2 class="title">Choisir l'années</h2>
        <select class="select" v-model="annee">
          <option v-for="item in anneeOptions" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="allData.length !== 0 && !isLoading">
      <Health
        v-if="annee === `Tous les années`"
        :catID="category"
        :data="allData"
        :mag="dataToShow.includes(`pointsDeVente-tous`)"
      />
      <HeathDate
        v-else
        :catID="category"
        :data="allData"
        :mag="dataToShow.includes(`pointsDeVente-tous`)"
        :annee="annee"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .box-select-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 80vw;
    margin: 0 auto;
    .box-select {
      .title {
        font-size: 1rem;
        margin-bottom: 0;
      }

      .select {
        width: 150px;
        height: 40px;
        padding: 2px;
        text-align: center;
        margin: 10px 15px;
      }
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .btn-white {
      margin: 10px;
      color: black;
      background-color: whitesmoke;
      border: solid 1px black;
    }

    .is-active {
      // border: solid 2px lightblue;
      background-color: rgb(0, 0, 0);
      color: white;
    }
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>
