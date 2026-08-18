import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";
import { canAccessOwnerControl } from "../shared/owner-control";

export function requireRoundsOwner(user: User | null): User {
  if (!user || !canAccessOwnerControl(user, process.env.ROUNDS_OWNER_EMAIL)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This Owner Control Center is restricted to the configured Rounds owner account." });
  }
  return user;
}
