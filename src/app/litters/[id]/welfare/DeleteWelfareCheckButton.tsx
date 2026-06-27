"use client";

import { useRouter } from "next/navigation";
import { deleteWelfareCheck } from "@/app/actions";

export default function DeleteWelfareCheckButton({
  checkId,
  litterId,
}: {
  checkId: string;
  litterId: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        if (!confirm("Delete this welfare check?")) return;
        await deleteWelfareCheck(checkId, litterId);
        router.refresh();
      }}
      className="text-xs text-red-500 hover:text-red-700"
    >
      Delete
    </button>
  );
}
