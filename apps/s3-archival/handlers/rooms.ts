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

const getRooms = async (id: string[]) => {
  return await PrismaClient.rooms.findMany({
    where: {
      id: {
        in: id,
      },
    },
  });
};

const getMessages = async (id: number[]) => {
  return await PrismaClient.messages.findMany({
    where: {
      id: {
        in: id,
      },
    },
  });
};

const deleteRooms = async (id: string[]) => {
  await PrismaClient.rooms.deleteMany({
    where: {
      id: {
        in: id,
      },
    },
  });

  console.log(`Deleted archived chat rooms from database`);
};

const deleteMessages = async (id: number[]) => {
  await PrismaClient.messages.deleteMany({
    where: {
      id: {
        in: id,
      },
    },
  });

  console.log(`Deleted archived chat messages from database`);
};

export default {
  identify: retrieveRooms,
  get: getRooms,
  delete: deleteRooms,
  messages: {
    get: getMessages,
    delete: deleteMessages,
  },
};
