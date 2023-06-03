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

export default retrieveListings;
