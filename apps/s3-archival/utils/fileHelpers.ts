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

export const generateCSV = (outputDir: string, data: any[], fileName: string) => {
  return new Promise<void>(async (resolve, reject) => {
    // Check if data is empty
    if (data.length === 0) {
      resolve();
      return;
    }

    console.log(`Generating CSV for ${fileName}`);

    const parser = new AsyncParser();
    const csv = await parser.parse(data).promise();

    // Writes the CSV to a file
    fs.writeFile(`${outputDir}/${fileName}.csv`, csv, (err) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      console.log(`CSV for ${fileName} generated`);
      resolve();
    });
  });
};
