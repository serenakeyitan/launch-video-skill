import React from "react";

// ── Mobile-app scene ───────────────────────────────────────────────────────
// A phone shell (rounded body, notch, side button) sized to a 9:19.5-ish
// viewport. Drop a screenshot/<Img> or live UI as children. Pick this for
// mobile app launches; pair with the Cursor primitive for tap interactions.

export const MobileFrame: React.FC<{
  /** content viewport width in px (height derived from ratio) */
  screenW?: number;
  ratio?: number; // height / width
  children?: React.ReactNode;
}> = ({ screenW = 390, ratio = 2.16, children }) => {
  const screenH = Math.round(screenW * ratio);
  const bezel = 14;
  return (
    <div
      style={{
        width: screenW + bezel * 2,
        height: screenH + bezel * 2,
        background: "#0c0c0c",
        borderRadius: 54,
        padding: bezel,
        boxShadow: "0 30px 80px rgba(40,70,55,0.32)",
        position: "relative",
      }}
    >
      {/* side button */}
      <div
        style={{
          position: "absolute",
          right: -3,
          top: 150,
          width: 3,
          height: 78,
          background: "#0c0c0c",
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: screenW,
          height: screenH,
          borderRadius: 42,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 132,
            height: 30,
            background: "#0c0c0c",
            borderRadius: "0 0 18px 18px",
            zIndex: 30,
          }}
        />
        {children}
      </div>
    </div>
  );
};
