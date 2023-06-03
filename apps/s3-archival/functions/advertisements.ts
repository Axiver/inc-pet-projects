import PrismaClient from "@inc/db";

const retrieveAdverts = async (archivalDate: Date) => {
  const endedAdvertisements = await PrismaClient.advertisements.findMany({
    where: {
      AND: [
        {
          endDate: {
            lte: new Date(),
          },
          startDate: {
            lte: new Date(),
          },
        },
        {
          updatedAt: {
            lte: archivalDate,
          },
        },
      ],
    },
  });

  const inactiveAdvertisements = await PrismaClient.advertisements.findMany({
    where: {
      active: false,
      AND: [
        {
          updatedAt: {
            lte: archivalDate,
          },
        },
      ],
    },
  });

  return [...endedAdvertisements, ...inactiveAdvertisements];
};

export default retrieveAdverts;
