"use client";
import { useEffect, useRef } from "react";
export function SupportModal({
  title,
  onClose,
  children,
  drawer = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      aria-label={title}
      className={drawer ? "support-history-drawer fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-xl overflow-y-auto bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/40" : "m-auto max-h-[90dvh] w-[min(680px,94vw)] overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/40"}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
      {drawer && <style>{`@keyframes supportDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } } .support-history-drawer[open] { animation: supportDrawerIn 220ms ease-out; } @media (prefers-reduced-motion: reduce) { .support-history-drawer[open] { animation: none; } }`}</style>}
      {children}
    </dialog>
  );
}
