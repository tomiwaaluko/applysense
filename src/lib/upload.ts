import { supabase } from "./supabase";

export async function uploadScreenshot(
  file: File,
  jobId: string,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${jobId}-${Date.now()}.${fileExt}`;
  const filePath = `screenshots/${fileName}`;

  const { error } = await supabase.storage
    .from("screenshots")
    .upload(filePath, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("screenshots").getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteScreenshot(imageUrl: string): Promise<void> {
  // Extract the file path from the URL
  const url = new URL(imageUrl);
  const filePath = url.pathname.split("/").slice(-2).join("/");

  const { error } = await supabase.storage
    .from("screenshots")
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
