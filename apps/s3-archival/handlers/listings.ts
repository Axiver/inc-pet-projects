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

const getListings = async (id: number[]) => {
  return await PrismaClient.listing.findMany({
    where: {
      id: {
        in: id,
      },
    },
  });
};

const getBookmarks = async (id: number[]) => {
  return await PrismaClient.listingBookmarks.findMany({
    where: {
      id: {
        in: id,
      },
    },
  });
};

const deleteListings = async (id: number[]) => {
  await PrismaClient.listing.deleteMany({
    where: {
      id: {
        in: id,
      },
    },
  });

  console.log("Deleted archived listings from database");
};

const deleteBookmarks = async (id: number[]) => {
  await PrismaClient.listingBookmarks.deleteMany({
    where: {
      id: {
        in: id,
      },
    },
  });

  console.log("Deleted archived listings bookmarks from database");
};

export default {
  identify: retrieveListings,
  get: getListings,
  delete: deleteListings,
  bookmarks: {
    get: getBookmarks,
    delete: deleteBookmarks,
  },
};
