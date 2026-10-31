// components/ui/ToastStack.tsx
// Also requires: @/lib/utils
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";
import { motion, useReducedMotion } from "motion/react";
import { Ban, Bell, CircleAlert, CircleCheck, LoaderCircle, TriangleAlert, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const css = `
.ts-viewport { --ts-line: color-mix(in srgb, var(--foreground) 10%, transparent); --ts-muted: color-mix(in srgb, var(--foreground) 58%, var(--background)); --ts-accent: var(--brand); position: absolute; z-index: 10; bottom: 10px; left: 50%; width: min(360px, calc(100% - 24px)); height: 145px; margin: 0; transform: translateX(-50%); pointer-events: none; outline: none; }
.ts-root { --gap: 10px; --peek: 12px; --scale: calc(max(0, 1 - (var(--toast-index) * .055))); --shrink: calc(1 - var(--scale)); --height: var(--toast-frontmost-height, var(--toast-height)); --offset-y: calc((var(--toast-offset-y) * -1) + (var(--toast-index) * var(--gap) * -1) + var(--toast-swipe-movement-y)); position: absolute; right: 0; bottom: 0; box-sizing: border-box; width: 100%; height: var(--height); margin: 0; border: 1px solid transparent; border-radius: 12px; background: var(--surface); background-clip: padding-box; color: var(--foreground); box-shadow: 0 0 0 1px oklch(0 0 0 / .06), 0 1px 2px -1px oklch(0 0 0 / .06), 0 2px 4px 0 oklch(0 0 0 / .04), 0 12px 28px -8px oklch(0 0 0 / .14); transform-origin: bottom center; transform: translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - (var(--toast-index) * var(--peek)) - (var(--shrink) * var(--height)))) scale(var(--scale)); transition: transform 420ms cubic-bezier(.22,1,.36,1), opacity 220ms ease, height 160ms ease, scale 420ms cubic-bezier(.22,1,.36,1), rotate 420ms cubic-bezier(.22,1,.36,1); scale: 1; rotate: 0deg; cursor: default; pointer-events: auto; user-select: none; z-index: calc(100 - var(--toast-index)); }
[data-home-theme="dark"] .ts-root { box-shadow: 0 0 0 1px oklch(1 0 0 / .08), 0 12px 28px -8px oklch(0 0 0 / .6); }
.ts-root::after { content: ""; position: absolute; top: 100%; left: 0; width: 100%; height: calc(var(--gap) + 1px); }
.ts-root[data-expanded] { height: var(--toast-height); transform: translateX(var(--toast-swipe-movement-x)) translateY(var(--offset-y)); }
.ts-root[data-starting-style], .ts-root[data-ending-style] { transform: translateX(var(--toast-swipe-movement-x)) translateY(24px) scale(.96); opacity: 0; }
.ts-root[data-ending-style][data-swipe-direction="left"] { transform: translateX(calc(var(--toast-swipe-movement-x) - 120%)) translateY(var(--offset-y)); }
.ts-root[data-ending-style][data-swipe-direction="right"] { transform: translateX(calc(var(--toast-swipe-movement-x) + 120%)) translateY(var(--offset-y)); }
.ts-root[data-ending-style][data-swipe-direction="up"] { transform: translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - 120%)); }
.ts-root[data-ending-style][data-swipe-direction="down"] { transform: translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) + 120%)); }
.ts-root[data-type="error"][data-starting-style] { animation: ts-shake 460ms ease-out; }
.ts-root[data-type="warning"] { transition-duration: 520ms; transition-timing-function: cubic-bezier(.2,1.6,.4,1); }
.ts-root[data-type="warning"][data-starting-style] { scale: .82; rotate: -6deg; }
.ts-root[data-type="warning"][data-ending-style] { scale: .86; rotate: 4deg; }
.ts-root[data-type="declined"][data-starting-style] { transform: translateX(calc(var(--toast-swipe-movement-x) + 34px)) translateY(10px) scale(.94); }
.ts-root[data-type="declined"][data-ending-style] { transform: translateX(calc(var(--toast-swipe-movement-x) + 42px)) translateY(0) scale(.96); }
.ts-root[data-limited] { opacity: 0; }
.ts-content { box-sizing: border-box; display: flex; align-items: center; gap: 16px; min-height: 68px; padding: 13px 14px; overflow: hidden; transition: opacity 220ms cubic-bezier(.22,1,.36,1); }
.ts-content[data-behind] { opacity: 0; }
.ts-content[data-expanded] { opacity: 1; }
.ts-icon { --tone: var(--ts-accent); display: grid; width: 34px; height: 34px; flex: none; place-items: center; border-radius: 10px; background: color-mix(in srgb, var(--tone) 13%, var(--background)); color: var(--tone); }
.ts-root[data-type="success"] .ts-icon { --tone: #0d9488; }
.ts-root[data-type="error"] .ts-icon, .ts-root[data-type="declined"] .ts-icon { --tone: #d92d35; }
.ts-root[data-type="warning"] .ts-icon { --tone: #b56a00; }
.ts-close { position: relative; display: grid; width: 30px; height: 30px; flex: none; place-items: center; overflow: hidden; border: 1px solid var(--ts-line); border-radius: 8px; background: var(--surface); color: var(--ts-muted); cursor: pointer; transition: background-color 130ms ease-out, color 130ms ease-out; }
.ts-close::before { position: absolute; inset: 0; border-radius: inherit; background: color-mix(in srgb, var(--ts-accent) 20%, var(--background)); content: ""; pointer-events: none; transform: scaleY(0); transform-origin: bottom; transition: transform 650ms linear; }
.ts-close[data-holding]::before { transform: scaleY(1); }
.ts-close[data-holding] { color: var(--foreground); }
.ts-close svg { position: relative; z-index: 1; }
@media (hover: hover) { .ts-close:hover { background: color-mix(in srgb, var(--foreground) 6%, var(--background)); color: var(--foreground); } }
.ts-close:focus-visible { outline: 2px solid var(--ts-accent); outline-offset: 2px; }
.ts-spin { animation: ts-spin 1s linear infinite; }
@keyframes ts-spin { to { transform: rotate(360deg); } }
@keyframes ts-shake { 0%, 100% { translate: 0 0; } 20% { translate: -8px 0; } 40% { translate: 7px 0; } 60% { translate: -5px 0; } 80% { translate: 3px 0; } }
@media (prefers-reduced-motion: reduce) {
  .ts-root, .ts-content, .ts-close, .ts-close::before { transition: none; }
  .ts-root[data-type="warning"] { transition-duration: 0s; }
  .ts-root[data-starting-style], .ts-root[data-ending-style] { transform: translateY(8px); scale: 1; rotate: 0deg; animation: none; }
  .ts-spin { animation: none; }
}
`;

const icons = {
  success: CircleCheck,
  upload: Upload,
  uploading: LoaderCircle,
  error: CircleAlert,
  warning: TriangleAlert,
  declined: Ban,
};

export type ToastStackType = keyof typeof icons;

export function ToastStackProvider({ children, timeout = 5000, limit = 3 }: { children: ReactNode; timeout?: number; limit?: number }) {
  return (
    <Toast.Provider timeout={timeout} limit={limit}>
      {children}
    </Toast.Provider>
  );
}

export const useToastStack = Toast.useToastManager;

const HOLD_MS = 650;

function CloseButton({ toastId, onClose, onCloseAll }: { toastId: string; onClose: (id: string) => void; onCloseAll: () => void }) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const [holding, setHolding] = useState(false);

  const startHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    didLongPress.current = false;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      didLongPress.current = true;
      setHolding(false);
      onCloseAll();
    }, HOLD_MS);
  };

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  };

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  return (
    <button
      type="button"
      className="ts-close"
      data-holding={holding ? "" : undefined}
      // แก้จากต้นฉบับ InitStudio: title และ aria-label เป็นภาษาไทย
      title="กดค้างเพื่อปิดทั้งหมด"
      aria-label="ปิดการแจ้งเตือน กดค้างเพื่อปิดทั้งหมด"
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={(event) => {
        if (event.key === " " && !event.repeat) startHold();
      }}
      onKeyUp={(event) => {
        if (event.key === " ") cancelHold();
      }}
      onClick={(event) => {
        if (didLongPress.current) {
          didLongPress.current = false;
          event.preventDefault();
          return;
        }
        onClose(toastId);
      }}
    >
      <X size={16} aria-hidden="true" />
    </button>
  );
}

export function ToastStack({ className }: { className?: string }) {
  const { toasts, close } = Toast.useToastManager();
  const reduced = useReducedMotion();
  const closeAll = () => toasts.forEach((toast) => close(toast.id));

  return (
    <>
      <style href="toast-stack" precedence="medium">
        {css}
      </style>
      {/* แก้จากต้นฉบับ InitStudio: aria-label ภาษาไทย */}
      <Toast.Viewport className={cn("ts-viewport", className)} aria-label="การแจ้งเตือน">
        {toasts.map((toast) => {
          const Icon = icons[toast.type as ToastStackType] ?? Bell;
          const shake = toast.type === "error";
          const tilt = toast.type === "warning" || toast.type === "declined";
          return (
            <Toast.Root key={toast.id} toast={toast} className="ts-root">
              <Toast.Content className="ts-content">
                <span className="ts-icon">
                  <motion.span
                    className="grid place-items-center"
                    initial={
                      reduced
                        ? false
                        : shake
                          ? { opacity: 0, x: -3 }
                          : tilt
                            ? { opacity: 0, scale: toast.type === "warning" ? 0.7 : 0.55, rotate: toast.type === "warning" ? -12 : 12 }
                            : false
                    }
                    animate={
                      reduced
                        ? { opacity: 1 }
                        : shake
                          ? { opacity: 1, x: [-3, 3, -2, 2, 0] }
                          : tilt
                            ? {
                                opacity: 1,
                                scale: [toast.type === "warning" ? 0.7 : 0.55, 1.08, 1],
                                rotate: toast.type === "warning" ? [-12, 4, 0] : [12, -4, 0],
                              }
                            : { opacity: 1 }
                    }
                    transition={reduced ? { duration: 0.12 } : shake || tilt ? { duration: 0.42, ease: "easeOut" } : { type: "spring", duration: 0.38, bounce: 0 }}
                  >
                    <Icon size={17} aria-hidden="true" className={toast.type === "uploading" ? "ts-spin" : undefined} />
                  </motion.span>
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <Toast.Title className="m-0 text-[14px] font-semibold leading-[1.3]" />
                  <Toast.Description className="m-0 text-[12px] leading-[1.45] text-foreground/60" />
                </div>
                <CloseButton toastId={toast.id} onClose={close} onCloseAll={closeAll} />
              </Toast.Content>
            </Toast.Root>
          );
        })}
      </Toast.Viewport>
    </>
  );
}
