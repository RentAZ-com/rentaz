"use client";

import { useState } from "react";
import { uploadListingImage } from "@/services/listings";

interface ImageUploaderProps {
  userId: string;
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ userId, images, onChange, max = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > max) {
      alert(`Maximum ${max} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { alert("Max file size is 5MB"); continue; }
        const url = await uploadListingImage(userId, file);
        urls.push(url);
      }
      onChange([...images, ...urls]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please try again.");
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-muted group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition">
            <span className="text-2xl mb-1">{uploading ? "⏳" : "📷"}</span>
            <span className="text-[10px] font-semibold text-slate-400">
              {uploading ? "Uploading..." : "Add Photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-400">{images.length}/{max} photos • Max 5MB each</p>
    </div>
  );
}
