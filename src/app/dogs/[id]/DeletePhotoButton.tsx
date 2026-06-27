"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto } from "../../actions";

export default function DeletePhotoButton({
  photoId,
  dogId,
}: {
  photoId: string;
  dogId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletePhoto(photoId, dogId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
    >
      {isPending ? "…" : "×"}
    </button>
  );
}
