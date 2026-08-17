export function canUseStudyMaterial(ownerUserId: number, requestingUserId: number): boolean {
  return ownerUserId === requestingUserId;
}
