import { AsyncParser } from "@json2csv/node";
import * as fs from "fs";

export const createOutputFolder = (outputDir: string) => {
  return new Promise((resolve, reject) => {
    // Create folder for CSVs
    fs.mkdir(outputDir, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      resolve(outputDir);
    });
  });
};

export const generateCSV = async (outputDir: string, listings: any, fileName: string) => {
  console.log(`Generating CSV for ${fileName}`);

  const parser = new AsyncParser();
  const csv = await parser.parse(listings).promise();

  // Writes the CSV to a file
  fs.writeFile(`${outputDir}/${fileName}.csv`, csv, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`CSV for ${fileName} generated`);
  });
};
