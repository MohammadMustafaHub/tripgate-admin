export interface UploadedImage {
  /** Storage key; this is what gets saved on entities such as trip programs. */
  key: string;
  /** Public URL the image is served from. */
  url: string;
}
