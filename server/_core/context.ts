import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByRoundsSessionHash } from "../db";
import { hashRoundsSessionToken } from "../rounds-auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const roundsToken = opts.req.header("x-rounds-session")?.trim();
    if (roundsToken) user = await getUserByRoundsSessionHash(hashRoundsSessionToken(roundsToken)) ?? null;
  } catch (error) {
    // Authentication is optional for public procedures; an invalid opaque session is ignored.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
