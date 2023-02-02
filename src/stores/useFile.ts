// logID le numéro d’identification unique de la ligne de log;
// prodID le numéro d’identification du produit concerné;
// catID le numéro d’identification de la catégorie du produit concerné;
// fabID le numéro d’identification du fabricant du produit concerné;
// dateID le numéro d’identification la date d’enregistrement de la ligne de log.
// magID le numéro d’identification du magasin avec qui le fabricant du produit a passé un accord de vente concernant ce produit;

import axios from "axios";

export const useFile = () => {
  const getFileData = async (fileName: string) => {
    const fileData: any[] = [];
    const data = await axios.get(fileName);
    data.data.split("\n").forEach((line: any) => {
      const checkLine = line.split(" ");
      if (checkLine.length === 4) {
        fileData.push({
          dateID: checkLine[0],
          prodID: checkLine[1],
          catID: checkLine[2],
          fabID: checkLine[3],
        });
      }

      if (checkLine.length === 5) {
        fileData.push({
          dateID: checkLine[0],
          prodID: checkLine[1],
          catID: checkLine[2],
          fabID: checkLine[3],
          magID: checkLine[4],
        });
      }
    });
    return fileData;
  };

  return {
    getFileData,
  };
};
