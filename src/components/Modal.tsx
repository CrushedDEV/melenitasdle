"use client";

import { useEffect } from "react";
import { CloseIcon } from "./Icon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actionLabel?: string;
}

/** Modal centrado con fondo oscuro. Se cierra con Escape, el botón o el fondo. */
export default function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  actionLabel = "Entendido",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card fade"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <CloseIcon size={18} />
        </button>
        <div className="modal-head">
          {icon && <span className="modal-icon">{icon}</span>}
          <h2>{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
