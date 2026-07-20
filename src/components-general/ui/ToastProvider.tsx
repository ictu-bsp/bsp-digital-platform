//src/components-general/ui/ToastProvider.tsx

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import Toast, { ToastType } from "./Toast";

interface ToastState {
  open: boolean;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext =
  createContext<ToastContextType | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: "success",
    title: "",
  });

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string
    ) => {
      setToast({
        open: true,
        type,
        title,
        message,
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      success: (
        title: string,
        message?: string
      ) =>
        showToast(
          "success",
          title,
          message
        ),

      error: (
        title: string,
        message?: string
      ) =>
        showToast(
          "error",
          title,
          message
        ),

      warning: (
        title: string,
        message?: string
      ) =>
        showToast(
          "warning",
          title,
          message
        ),

      info: (
        title: string,
        message?: string
      ) =>
        showToast(
          "info",
          title,
          message
        ),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context =
    useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used within a ToastProvider."
    );
  }

  return context;
}