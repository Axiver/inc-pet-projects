import PrismaClient from "@inc/db";

const retrieveRooms = async (archivalDate: Date) => {
  const result = await PrismaClient.messages.groupBy({
    by: ["room"],
  });

  return result;
};

export default retrieveRooms;
