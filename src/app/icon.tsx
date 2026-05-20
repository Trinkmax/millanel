import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F8F3EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="26"
          height="26"
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
