import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Millanel Frías — Perfumería, cosmética y cuidado personal";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #F8F3EA 0%, #ECF3F9 60%, #FAEAE5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
            color: "#161F3F",
            textAlign: "center",
          }}
        >
          <svg
            width="120"
            height="120"
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
          <div style={{ fontSize: 100, lineHeight: 1, letterSpacing: "-0.02em" }}>
            millanel
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#354C79",
              fontStyle: "italic",
              maxWidth: 880,
            }}
          >
            Una invitación a tu propio ritual.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#767C8E",
              fontFamily: "Helvetica, sans-serif",
            }}
          >
            Frías · Santiago del Estero
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
