"use client";

interface ProToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export function ProToggle({ isOn, onToggle }: ProToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? "bg-kaki" : "bg-kuroko/20"}`}
      aria-label="プロモードを切り替え"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
