export function canManageCommunityContent(ownerId: number, viewerId: number): boolean {
  return Number.isInteger(ownerId) && ownerId === viewerId;
}
