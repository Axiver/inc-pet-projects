import { advertHandler, listingsHandler, roomsHandler } from "./handlers";

// -- Constants -- //
const archivalDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 3 Months

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

// -- Main -- //
const main = async () => {
  // Print out some information about the archival process
  console.log("Starting archival process for database " + process.env.DATABASE_URL);
  console.log(`Archiving listings older than ${archivalDate}`);
  console.log("Identifying data to archive");

  // Identify the data to be archived
  const dataToBeArchived = await identifyDataToBeArchived();

  console.log("Retrieving data to archive");

  // Get the data to be archived
  const data = await getDataToBeArchived(dataToBeArchived);

  console.log("Data retrieved");
  console.log("Generating csv files");

  console.log({ data });
};

main();
