import PrismaClient from "@inc/db";

const retrieveAdverts = async (archivalDate: Date) => {
  const result = await PrismaClient.advertisements.findMany({
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
      OR: [
        {
          active: false,
          AND: [
            {
              updatedAt: {
                lte: archivalDate,
              },
            },
          ],
        },
      ],
    },
  });

  return result;
};

export default retrieveAdverts;
