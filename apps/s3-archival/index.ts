import retrieveAdverts from "./functions/advertisements";
import retrieveListings from "./functions/listings";
import retrieveRooms from "./functions/rooms";

// -- Constants -- //
const archivalDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 3 Months

// -- Functions -- //

// -- Main -- //
const main = async () => {
  // Print out some information about the archival process
  console.log("Starting archival process");
  console.log(`Archiving listings older than ${archivalDate}`);
  console.log("Retrieving data to archive");

  // Retrieve the data to archive
  const listings = await retrieveListings(archivalDate);
  const advertisements = await retrieveAdverts(archivalDate);
  const rooms = await retrieveRooms(archivalDate);

  console.log({ rooms });
};

main();
