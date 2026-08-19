/**
 * Learning is local by default. A server-backed Rounds profile is needed only
 * for social features whose posts, reactions, replies, and alerts must belong
 * to a verified account.
 */
export function hasCommunityProfile(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}

export function shouldQueryCommunityData(isAuthenticated: boolean): boolean {
  return hasCommunityProfile(isAuthenticated);
}
