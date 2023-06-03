import PrismaClient from "@inc/db";

const retrieveRooms = async (archivalDate: Date) => {
  const result = await PrismaClient.rooms.findMany({
    select: {
      id: true,
      messages: {
        select: {
          id: true,
        },
      },
    },
    where: {
      messages: {
        every: {
          createdAt: {
            lte: archivalDate,
          },
        },
      },
    },
  });

  return result;
};

export default {
  identify: retrieveRooms,
};
