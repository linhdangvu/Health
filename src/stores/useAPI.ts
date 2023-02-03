import axios from "axios";

export const useAPI = async () => {
  const getData = async (url: string, id: number) => {
    try {
      const dataHeaders: any = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://51.255.166.155:1353/",
      };
      const data = await axios.get(
        "http://51.255.166.155:1353/logAccordsVente/2/?format=json",
        {
          headers: dataHeaders,
        }
      );
      return data.data;
    } catch (e) {
      return null;
    }
  };

  // MAX: 641820, Min: 1
  const getDataRange = async (
    url: string,
    start: number = 1,
    end: number = 10
  ) => {
    const data: any[] = [];
    for (let i = start; i <= end; i++) {
      const x = await getData(url, i);
      if (x === null) {
        break;
      }
      data.push(x);
    }
  };

  return {
    getDataRange,
  };
};
