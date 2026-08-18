import AsyncStorage from "@react-native-async-storage/async-storage";

import { COURSE_PACKS, type CoursePack } from "../shared/course-packs";

export const COURSE_PACK_INSTALLS_KEY = "rounds.course-packs.installs.v1";
export const COURSE_PACK_RESUME_KEY = "rounds.course-packs.resume.v1";

export type CoursePackInstall = { packId: string; revision: string; installedAt: string };
export type CoursePackResume = { packId: string; courseId: string; updatedAt: string };

const coursePackById = (packId: string) => COURSE_PACKS.find((pack) => pack.id === packId);

/** Filters persisted state against the current reviewed catalog so a retired or revised record cannot masquerade as installed content. */
export function parseCoursePackInstalls(value: string | null, catalog: CoursePack[] = COURSE_PACKS): CoursePackInstall[] {
  if (!value) return [];
  try {
    const records = JSON.parse(value) as unknown;
    if (!Array.isArray(records)) return [];
    const seen = new Set<string>();
    return records.flatMap((record) => {
      if (!record || typeof record !== "object") return [];
      const candidate = record as Partial<CoursePackInstall>;
      if (typeof candidate.packId !== "string" || typeof candidate.revision !== "string" || typeof candidate.installedAt !== "string" || seen.has(candidate.packId)) return [];
      const pack = catalog.find((item) => item.id === candidate.packId);
      if (!pack || pack.delivery !== "downloadable" || pack.revision !== candidate.revision) return [];
      seen.add(candidate.packId);
      return [{ packId: candidate.packId, revision: candidate.revision, installedAt: candidate.installedAt }];
    });
  } catch {
    return [];
  }
}

export function parseCoursePackResume(value: string | null, catalog: CoursePack[] = COURSE_PACKS): CoursePackResume | null {
  if (!value) return null;
  try {
    const candidate = JSON.parse(value) as Partial<CoursePackResume>;
    if (typeof candidate.packId !== "string" || typeof candidate.courseId !== "string" || typeof candidate.updatedAt !== "string") return null;
    const pack = catalog.find((item) => item.id === candidate.packId);
    if (!pack || !pack.courses.some((course) => course.id === candidate.courseId)) return null;
    return { packId: candidate.packId, courseId: candidate.courseId, updatedAt: candidate.updatedAt };
  } catch {
    return null;
  }
}

export function isPackInstalled(pack: CoursePack, installs: CoursePackInstall[]): boolean {
  if (pack.delivery === "embedded") return true;
  return installs.some((install) => install.packId === pack.id && install.revision === pack.revision);
}

export function canInstallPack(pack: CoursePack): boolean {
  return pack.delivery === "downloadable" && pack.readiness === "active";
}

export async function loadCoursePackInstalls(): Promise<CoursePackInstall[]> {
  return parseCoursePackInstalls(await AsyncStorage.getItem(COURSE_PACK_INSTALLS_KEY));
}

export async function loadCoursePackResume(): Promise<CoursePackResume | null> {
  return parseCoursePackResume(await AsyncStorage.getItem(COURSE_PACK_RESUME_KEY));
}

export async function installLocalCoursePack(packId: string): Promise<CoursePackInstall | null> {
  const pack = coursePackById(packId);
  if (!pack || !canInstallPack(pack)) return null;
  const current = await loadCoursePackInstalls();
  const existing = current.find((install) => install.packId === pack.id && install.revision === pack.revision);
  if (existing) return existing;
  const next = [...current.filter((install) => install.packId !== pack.id), { packId: pack.id, revision: pack.revision, installedAt: new Date().toISOString() }];
  await AsyncStorage.setItem(COURSE_PACK_INSTALLS_KEY, JSON.stringify(next));
  return next[next.length - 1];
}

export async function saveCoursePackResume(packId: string, courseId: string): Promise<CoursePackResume | null> {
  const pack = coursePackById(packId);
  if (!pack || !pack.courses.some((course) => course.id === courseId)) return null;
  const resume = { packId, courseId, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(COURSE_PACK_RESUME_KEY, JSON.stringify(resume));
  return resume;
}
