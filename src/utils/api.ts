import axios from "axios";

const getData = async (id: number) => {
  try {
    const data = await axios.get(
      "http://51.255.166.155:1353/logProduits/" + id + "/?format=json"
    );
    return data.data;
  } catch (e) {
    return null;
  }
};

// MAX: 641820, Min: 1
const getDataRange = (start: number = 1, end: number = 10) => {
  const data: any[] = [];
  for (let i = start; i <= end; i++) {
    const x = getData(i);
    if (x === null) {
      break;
    }
    data.push(x);
  }
};
