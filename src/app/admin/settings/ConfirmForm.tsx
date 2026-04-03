"use client";

import { FormEventHandler } from "react";

export function ConfirmForm({ action, children, className }: { action: any, children: React.ReactNode, className?: string }) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
     if (!window.confirm("Are you sure you want to save these system changes?")) {
        e.preventDefault();
     }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
