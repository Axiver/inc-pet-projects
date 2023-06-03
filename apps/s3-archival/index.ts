import retrieveAdverts from "./functions/advertisements";
import retrieveRooms from "./functions/rooms";

// -- Constants -- //
const archivalDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 3 Months

// -- Functions -- //
import PrismaClient from "@inc/db";

const retrieveListings = async (archivalDate: Date) => {
  const result = await PrismaClient.listing.findMany({
    where: {
      AND: [
        {
          archived: true,
        },
        {
          updatedAt: {
            lte: archivalDate,
          },
        },
      ],
      OR: [
        {
          deletedAt: {
            not: null,
          },
        },
      ],
    },
  });

  return result;
};

// -- Main -- //
const main = async () => {
  // Print out some information about the archival process
  console.log("Starting archival process");
  console.log(`Archiving listings older than ${archivalDate}`);
  console.log("Retrieving data to archive");

  // Retrieve the data to archive
  const listings = await retrieveListings(archivalDate);
  // const advertisements = await retrieveAdverts(archivalDate);
  // const rooms = await retrieveRooms(archivalDate);

  // console.log({ rooms });
};

main();
