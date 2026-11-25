export interface UploadedFilePayload {
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string | null;
}

const MAX_INLINE_DATA_BYTES = 1_500_000; // 1.5 MB max inline DataURL for JSONB storage

export function readSupportingFile(file: File): Promise<UploadedFilePayload> {
  return new Promise((resolve) => {
    const base: UploadedFilePayload = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: null,
    };

    if (file.size > MAX_INLINE_DATA_BYTES) {
      resolve(base);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = typeof ev.target?.result === "string" ? ev.target.result : null;
      resolve({
        ...base,
        dataUrl: result,
      });
    };
    reader.onerror = () => resolve(base);
    reader.readAsDataURL(file);
  });
}
