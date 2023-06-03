import { advertHandler, listingsHandler, roomsHandler } from "./handlers";
import { Glacier } from "aws-sdk";
import { Readable } from "stream";
import * as fs from "fs";
import * as path from "path";

// -- Constants -- //
const archivalDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 3 Months
const glacier = new Glacier({ region: process.env.AWS_REGION });
const vaultName = "siwma-archival";
const projectDir = path.resolve(__dirname);
const csvFilePath = path.join(projectDir, "output", "test.csv");
const archiveId =
  "KjrYazB2aEYSxrqp0mrxonO12GsMCHfQRG0ugE7MnS6m25BfP99C58iLFOnaZa4Q0zF_Zzw-IsKj4BeM0Tv9eculD0yk6Ci4go9IgWQqnopUhtQi8sy43enflFk9WyxQU45fy9i97w";

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
const getDataToBeArchived = async (
  dataToBeArchived: Awaited<ReturnType<typeof identifyDataToBeArchived>>
) => {
  // Construct array of ids to be archived
  const listingIds = dataToBeArchived.listings.map((listing) => listing.id);
  const bookmarkIds = dataToBeArchived.listings
    .map((listing) => listing.listingBookmarks.map((bookmark) => bookmark.id))
    .flat();
  const advertIds = dataToBeArchived.advertisements.map((advert) => advert.id);
  const roomIds = dataToBeArchived.rooms.map((room) => room.id);
  const messageIds = dataToBeArchived.rooms
    .map((room) => room.messages.map((message) => message.id))
    .flat();

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

const uploadCSVToGlacier = async (vaultName: string, filePath: string) => {
  const fileData = fs.readFileSync(filePath);
  const fileBuffer = Buffer.from(fileData);

  const uploadResponse = await glacier
    .uploadArchive({
      accountId: process.env.AWS_ACCOUNT_ID,
      vaultName,
      archiveDescription: `CSV file: ${filePath}`,
      body: fileBuffer,
    })
    .promise();

  console.log(`Upload successful. Archive ID: ${uploadResponse.archiveId}`);
};

const retrieveFromGlacier = async (): Promise<any> => {
  glacier.initiateJob({
    accountId: process.env.AWS_ACCOUNT_ID,
    vaultName,
    jobParameters: {
      Type: "archive-retrieval",
      ArchiveId: archiveId,
      Description: "Archive retrieval job",
    },
  }).promise();
};

// -- Main -- //
const main = async () => {
  // Print out some information about the archival process
  console.log(
    "Starting archival process for database " + process.env.DATABASE_URL
  );
  console.log(`Archiving listings older than ${archivalDate}`);
  console.log("Identifying data to archive");

  // Identify the data to be archived
  const dataToBeArchived = await identifyDataToBeArchived();

  console.log("Retrieving data to archive");

  // Get the data to be archived
  const data = await getDataToBeArchived(dataToBeArchived);

  console.log("Data retrieved");
  console.log("Generating csv files");

  console.log("CSV Uploaded");
  console.log("Uploading to Glacier");

  // uploadCSVToGlacier(vaultName, csvFilePath)
  //   .then(() => {
  //     console.log("All files uploaded to Glacier successfully");
  //   })
  //   .catch((error) => {
  //     console.error("Failed: ", error);
  //   });

  // console.log({ data });

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
