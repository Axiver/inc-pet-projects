import { AuthError, ForbiddenError, TokenExpiredError } from "@/errors/AuthError";
import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { APIRequestType } from "@/utils/api/server/apiHandler";
import PrismaClient from "@/utils/prisma";
import { validateToken } from "@/utils/api/server/authHandler";

export type APIGuardOptions = {
  allowNonAuthenticated?: boolean;
  allowAdminsOnly?: boolean;
};

/**
 * Checks if a access token is valid
 * @param userId The id of the user
 * @param token The token to check
 */
async function validateAccessToken(userId: string, token: string) {
  // Retrieve the token from the database
  const accessToken = await PrismaClient.access_tokens.findFirst({
    where: {
      token,
    },
  });

  // Check if the token is valid
  return validateToken({ userId, token: accessToken });
}

/**
 * Protects API routes
 * @param options Options for the middleware
 */
export const apiGuardMiddleware = (options?: APIGuardOptions) => {
  // Return the middleware function
  return async (req: APIRequestType, res: NextApiResponse, next: NextHandler) => {
    // Perform an auth check if required (defaults to true)
    if (!options?.allowNonAuthenticated) {
      // Check if the user is authenticated
      if (!req.token || !req.token.accessToken || !req.token.refreshToken) {
        // User is not authenticated
        // Throw an error
        throw new AuthError();
      }

      // User is authenticated, check if the access token is valid
      await validateAccessToken(req.token.user.id, req.token.accessToken);
    }

    // Perform an admin check if required (defaults to false)
    if (options?.allowAdminsOnly) {
      // Check if the user is an admin
      if (!req.token?.isAdmin) {
        // User is not an admin
        // Throw an error
        throw new ForbiddenError(req.token?.name);
      }
    }

    // Continue to handle the request
    next();
  };
};
