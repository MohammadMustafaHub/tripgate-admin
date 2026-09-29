import { fail, ok, type Result } from "@/lib/result";
import type { UploadedImage } from "@/models/media";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type UploadImageError = "UNKNOWN_ERROR";

export async function uploadImage({
  file,
}: {
  file: File;
}): Promise<Result<UploadedImage, UploadImageError>> {
  try {
    const form = new FormData();
    form.append("File", file);
    const response = await client.post<SuccessResponse<UploadedImage>>("/Media/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return ok(response.data.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}

export type UploadImagesError = "UNKNOWN_ERROR";

export async function uploadImages({
  files,
}: {
  files: File[];
}): Promise<Result<UploadedImage[], UploadImagesError>> {
  try {
    const form = new FormData();
    for (const file of files) form.append("Files", file);
    const response = await client.post<SuccessResponse<UploadedImage[]>>("/Media/images/batch", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return ok(response.data.data);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}
