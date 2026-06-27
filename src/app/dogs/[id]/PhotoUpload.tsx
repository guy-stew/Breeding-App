"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { savePhoto } from "../../actions";

export default function PhotoUpload({ dogId }: { dogId: string }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size.
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${dogId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(path);

      startTransition(async () => {
        const res = await savePhoto(dogId, publicUrl, caption);
        if (!res.ok) {
          setError(res.error);
        } else {
          setCaption("");
          router.refresh();
        }
        setUploading(false);
      });
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-xs text-neutral-500" htmlFor="caption">
          Caption (optional)
        </label>
        <input
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. 4 weeks old"
          className={inputClass}
        />
      </div>

      <label
        className={`block cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 p-4 text-center text-sm hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:hover:border-blue-500 ${uploading || isPending ? "pointer-events-none opacity-50" : ""}`}
      >
        {uploading || isPending ? "Uploading…" : "Choose photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || isPending}
          className="hidden"
        />
      </label>
      <p className="mt-1 text-xs text-neutral-400">
        Max 5 MB · JPG, PNG, or WebP
      </p>
    </div>
  );
}
