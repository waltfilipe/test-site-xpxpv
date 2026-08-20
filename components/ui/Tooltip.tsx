"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  content: string | ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "auto";
  block?: boolean;
};

type Placement = "top" | "bottom";

export function Tooltip({
  content,
  children,
  side = "auto",
  block,
}: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; placement: Placement }>({
    x: 0,
    y: 0,
    placement: "top",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tipHeight = tipRef.current?.offsetHeight ?? 80;
    const tipWidth = tipRef.current?.offsetWidth ?? 260;
    const margin = 10;
    const gap = 8;

    let placement: Placement = "top";
    if (side === "bottom") {
      placement = "bottom";
    } else if (side === "top") {
      placement = "top";
    } else {
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      placement =
        spaceAbove >= tipHeight + gap + margin || spaceAbove >= spaceBelow
          ? "top"
          : "bottom";
    }

    const centerX = rect.left + rect.width / 2;
    const halfW = tipWidth / 2;
    const x = Math.min(
      window.innerWidth - margin - halfW,
      Math.max(margin + halfW, centerX),
    );
    const y = placement === "top" ? rect.top - gap : rect.bottom + gap;

    setCoords({ x, y, placement });
  }, [side]);

  const show = () => {
    setVisible(true);
    requestAnimationFrame(() => {
      updatePosition();
      requestAnimationFrame(updatePosition);
    });
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [visible, updatePosition, content]);

  if (!content) return <>{children}</>;

  const isRich = typeof content !== "string";

  const portal =
    visible && mounted
      ? createPortal(
          <div
            ref={tipRef}
            id={tipId}
            className={`tip-portal tip-portal-${coords.placement}${isRich ? " tip-box-rich" : ""}`}
            style={{ left: coords.x, top: coords.y }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className={`tip-wrap tip-wrap-trigger${block ? " tip-wrap-block" : ""}`}
        tabIndex={0}
        aria-describedby={visible ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {portal}
    </>
  );
}
