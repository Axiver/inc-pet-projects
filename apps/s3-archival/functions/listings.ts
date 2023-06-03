import PrismaClient from "@inc/db";

const select = {
  id: true,
  listingBookmarks: {
    select: {
      id: true,
    },
  },
};

const retrieveListings = async (archivalDate: Date) => {
  const archivedListings = await PrismaClient.listing.findMany({
    select,
    where: {
      AND: [
        {
          archived: true,
          updatedAt: {
            lte: archivalDate,
          },
        },
      ],
    },
  });

  const deletedListings = await PrismaClient.listing.findMany({
    select,
    where: {
      deletedAt: {
        lte: archivalDate,
      },
    },
  });

  return [...archivedListings, ...deletedListings];
};

export default retrieveListings;
