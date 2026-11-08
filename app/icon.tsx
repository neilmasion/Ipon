import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF5F8",
          borderRadius: 8,
          border: "2px solid #FF4F81",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#FF4F81",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          ₱
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
