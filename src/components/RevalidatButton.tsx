"use client";

function RevalidateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 bg-gray-800 text-white px-3 py-1 rounded"
    >
      Re-run Validation (Tier 0/1)
    </button>
  );
}

export default RevalidateButton;
