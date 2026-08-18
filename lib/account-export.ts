import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { accountExportFilename, accountExportContainsSensitiveFields } from "@/shared/account-privacy";

export async function shareRoundsAccountExport(data: unknown) {
  if (accountExportContainsSensitiveFields(data)) throw new Error("The account export contains a protected field and was not created.");
  const filename = accountExportFilename();
  const content = JSON.stringify(data, null, 2);

  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const directory = FileSystem.cacheDirectory;
  if (!directory) throw new Error("Your device could not prepare a private export file.");
  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device.");
  await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Save your Rounds account export" });
}
