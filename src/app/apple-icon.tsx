import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #F8F3EA 0%, #D8E6F0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#212F5B">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                d="M50 8 C 60 22, 60 38, 50 50 C 40 38, 40 22, 50 8 Z"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="7.5" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
