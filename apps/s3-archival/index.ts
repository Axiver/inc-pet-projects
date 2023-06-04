import { advertHandler, listingsHandler, roomsHandler } from "./handlers";
import { Glacier } from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { createOutputFolder, generateCSV } from "./utils";

// -- Constants -- //
const archivalDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 3 Months
const glacier = new Glacier({ region: process.env.AWS_REGION });
const vaultName = "siwma-archival";
const projectDir = path.resolve(__dirname);
const currDate = new Date().toISOString().split("T")[0];
const csvFilePath = path.join(projectDir, "output", currDate);

// -- Functions -- //
/**
 * Identifies the data to be archived
 */
const identifyDataToBeArchived = async () => {
  // Retrieve the data to archive
  const listings = await listingsHandler.identify(archivalDate);
  const advertisements = await advertHandler.identify(archivalDate);
  const rooms = await roomsHandler.identify(archivalDate);

  // Calculate the number of listing bookmarks and messages to archive
  const listingBookmarksCount = listings.reduce((acc, listing) => {
    return acc + listing.listingBookmarks.length;
  }, 0);

  const messagesCount = rooms.reduce((acc, room) => {
    return acc + room.messages.length;
  }, 0);

  // Print out number of rows to be archived
  console.log("Identified the following data to archive:");
  console.log(`- Listings: ${listings.length}`);
  console.log(`- Listing Bookmarks: ${listingBookmarksCount}`);
  console.log(`- Advertisements: ${advertisements.length}`);
  console.log(`- Chats: ${rooms.length}`);
  console.log(`- Messages: ${messagesCount}`);

  // Return the data to be archived
  return {
    listings,
    advertisements,
    rooms,
  };
};

/**
 * Obtains the data to be archived
 */
const getDataToBeArchived = async (dataToBeArchived: Awaited<ReturnType<typeof identifyDataToBeArchived>>) => {
  // Construct array of ids to be archived
  const listingIds = dataToBeArchived.listings.map((listing) => listing.id);
  const bookmarkIds = dataToBeArchived.listings.map((listing) => listing.listingBookmarks.map((bookmark) => bookmark.id)).flat();
  const advertIds = dataToBeArchived.advertisements.map((advert) => advert.id);
  const roomIds = dataToBeArchived.rooms.map((room) => room.id);
  const messageIds = dataToBeArchived.rooms.map((room) => room.messages.map((message) => message.id)).flat();

  // Retrieve the data to archive
  const listings = await listingsHandler.get(listingIds);
  const listingBookmarks = await listingsHandler.bookmarks.get(bookmarkIds);
  const advertisements = await advertHandler.get(advertIds);
  const rooms = await roomsHandler.get(roomIds);
  const messages = await roomsHandler.messages.get(messageIds);

  return {
    listings,
    listingBookmarks,
    advertisements,
    rooms,
    messages,
  };
};

const uploadCSVToGlacier = async (vaultName: string, filePath: string, dataToBeArchived) => {
  return new Promise<void>((resolve, reject) => {
    const jsonPath = path.join(projectDir, "output", "index.json");
    const jsonData = fs.readFileSync(jsonPath, "utf-8");
    const parsedJsonData = JSON.parse(jsonData);

    fs.readdir(filePath, (err, files) => {
      if (err) {
        console.log("Error reading directory:", err);
        return;
      }

      const fileNames = files.filter((file) => {
        return fs.statSync(`${filePath}/${file}`).isFile();
      });

      fileNames.forEach(async (fileName) => {
        const csvPath = path.join(filePath, fileName);
        const type = fileName.split(".")[0];
        const fileData = fs.readFileSync(csvPath);
        const fileBuffer = Buffer.from(fileData);
        let ids: number[] = [];

        const uploadResponse = await glacier
          .uploadArchive({
            accountId: process.env.AWS_ACCOUNT_ID,
            vaultName,
            archiveDescription: `CSV file: ${filePath}`,
            body: fileBuffer,
          })
          .promise();

        console.log(`Upload successful. Archive ID: ${uploadResponse.archiveId}`);

        if (type === "advertisements") {
          ids = dataToBeArchived.advertisements.map((advertisement) => advertisement.id);
        } else if (type === "listingBookmarks") {
          dataToBeArchived.listings.forEach((listing) => {
            listing.listingBookmarks.forEach((bookmark) => {
              ids.push(bookmark.id);
            });
          });
        } else if (type === "listings") {
          ids = dataToBeArchived.listings.map((listing) => listing.id);
        } else if (type === "messages") {
          dataToBeArchived.rooms.forEach((room) => {
            room.messages.forEach((message) => {
              ids.push(message.id);
            });
          });
        } else if (type === "rooms") {
          ids = dataToBeArchived.rooms.map((room) => room.id);
        }

        ids.forEach((id) => {
          if (!parsedJsonData[type]) {
            parsedJsonData[type] = {}; // Initialize the object if it doesn't exist
          }
          parsedJsonData[type][id] = uploadResponse.archiveId;
        });

        fs.writeFile(jsonPath, JSON.stringify(parsedJsonData, null, 2), (err) => {
          if (err) {
            console.log("Error writing to JSON file:", err);
            return;
          }

          resolve();
        });
      });
    });
  });
};

// const retrieveFromGlacier = async (): Promise<any> => {
//   glacier
//     .initiateJob({
//       accountId: process.env.AWS_ACCOUNT_ID,
//       vaultName,
//       jobParameters: {
//         Type: "archive-retrieval",
//         ArchiveId: archiveId,
//         Description: "Archive retrieval job",
//       },
//     })
//     .promise();
// };

const cleanUpDatabase = async (dataToBeArchived: Awaited<ReturnType<typeof identifyDataToBeArchived>>) => {
  console.log("Deleting data from database");

  // Construct array of ids to be archived
  const listingIds = dataToBeArchived.listings.map((listing) => listing.id);
  const bookmarkIds = dataToBeArchived.listings.map((listing) => listing.listingBookmarks.map((bookmark) => bookmark.id)).flat();
  const advertIds = dataToBeArchived.advertisements.map((advert) => advert.id);
  const roomIds = dataToBeArchived.rooms.map((room) => room.id);
  const messageIds = dataToBeArchived.rooms.map((room) => room.messages.map((message) => message.id)).flat();

  // Delete the data to archive
  await listingsHandler.delete(listingIds);
  await listingsHandler.bookmarks.delete(bookmarkIds);
  await advertHandler.delete(advertIds);
  await roomsHandler.delete(roomIds);
  await roomsHandler.messages.delete(messageIds);
};

// -- Main -- //
const main = async () => {
  // Print out some information about the archival process
  console.log("Starting archival process for database " + process.env.DATABASE_URL);
  console.log(`Archiving listings older than ${archivalDate}`);
  console.log("Identifying data to archive");

  // Identify the data to be archived
  const dataToBeArchived = await identifyDataToBeArchived();
  console.log(dataToBeArchived);

  console.log("Retrieving data to archive");

  // Get the data to be archived
  const data = await getDataToBeArchived(dataToBeArchived);

  console.log("Data retrieved");
  console.log("Generating CSVs");

  // Create folder for CSVs
  const outputDir = path.join("./output/", currDate);
  await createOutputFolder(outputDir);

  // Generate CSV files
  const promises = Object.keys(data).map((key) => generateCSV(outputDir, data[key], key));

  await Promise.all(promises);

  console.log("CSV Uploaded");
  console.log("Uploading to Glacier");

  await uploadCSVToGlacier(vaultName, csvFilePath, dataToBeArchived).catch((error) => {
    console.error("Failed: ", error);
  });

  console.log("All files uploaded to Glacier successfully");

  // Delete data from the database
  console.log("Cleaning up database");
  await cleanUpDatabase(dataToBeArchived);

  // Retrieving of Archive (By initiating through jobs)
  // glacier.initiateJob(
  //   {
  //     accountId: '-',
  //     vaultName: vaultName,
  //     jobParameters: {
  //       Type: "archive-retrieval",
  //       ArchiveId: archiveId,
  //       Description: "Archive retrieval job",
  //     },
  //   },
  //   function (err, data) {
  //     if (err) {
  //       console.log('Error initiating retrieval job:', err);
  //     } else {
  //       console.log('Retrieval job initiated successfully.');
  //       console.log('Job ID:', data.jobId);
  //     }
  //   }
  // );

  // Getting job progress
  // glacier.describeJob(
  //   {
  //     accountId: '-',
  //     vaultName: vaultName,
  //     jobId: "VjFSF5MgORJyKs8qPurGiZo0jRQqpByRguZEDoY8f4B9XVzX6vOzKV8B0s3jLfKPBH87tNon24mEnhzeIQzg9ycB6ZFU",
  //   },
  //   function (err, data) {
  //     if (err) {
  //       console.log('Error retrieving job status:', err);
  //     } else {
  //       console.log('Job status:', data.StatusCode);
  //       console.log('Job completion date:', data.CompletionDate);
  //       console.log('Job output location:', data.SNSTopic);
  //       console.log('Job archive size:', data.ArchiveSizeInBytes);
  //       // ... handle other job properties as needed
  //     }
  //   }
  // );
};

main();
