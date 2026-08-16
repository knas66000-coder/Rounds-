import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

export type EncodedAudio = {
  base64Audio: string;
  mimeType: "audio/m4a" | "audio/webm";
};

export async function encodeRecordedAudio(uri: string): Promise<EncodedAudio> {
  if (Platform.OS !== "web") {
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { base64Audio, mimeType: "audio/m4a" };
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const base64Audio = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("Recorded audio could not be encoded."));
        return;
      }
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Recorded audio could not be encoded."));
    reader.readAsDataURL(blob);
  });
  return { base64Audio, mimeType: "audio/webm" };
}
