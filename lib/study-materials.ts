import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
export { MAX_STUDY_MATERIAL_BYTES, STUDY_MATERIAL_MIME_TYPE, studyMaterialProblem } from "../shared/study-material-validation";

export async function encodeStudyMaterial(uri: string): Promise<string> {
  if (Platform.OS !== "web") {
    return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("The selected study material could not be read."));
        return;
      }
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("The selected study material could not be read."));
    reader.readAsDataURL(blob);
  });
}
