import { UploadApiOptions, v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export async function uploadFile(
  filePath: string,
  options?: UploadApiOptions
): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, options);
  return result.secure_url;
}

export async function uploadFileFromBuffer(
  buffer: Buffer,
  options?: UploadApiOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options || {},
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
