import PrismaClient from "@inc/db";

// Identifies the advertisements to be archived
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

const getAdverts = async (id: number[]) => {
  return await PrismaClient.advertisements.findMany({
    where: {
      id: {
        in: id,
      },
    },
  });
};

const deleteAdverts = async (id: number[]) => {
  await PrismaClient.advertisements.deleteMany({
    where: {
      id: {
        in: id,
      },
    },
  });

  console.log(`Deleted archived advertisements from database`);
};

export default {
  identify: retrieveAdverts,
  get: getAdverts,
  delete: deleteAdverts,
};
