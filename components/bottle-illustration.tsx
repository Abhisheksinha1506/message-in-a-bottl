import { cn } from "@/lib/utils";
export function BottleIllustration({
  className,
  small = false,
}: {
  className?: string;
  small?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      className={cn(className)}
      aria-hidden="true"
    >
      {!small && (
        <>
          <ellipse
            cx="93"
            cy="151"
            rx="55"
            ry="9"
            fill="#557b70"
            opacity=".09"
          />
          <path
            d="M23 111c12-4 18 4 29 0m68 24c13-4 20 3 34-1M34 137c8-3 13 1 21 0"
            stroke="#799f92"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
      <g transform="rotate(19 88 93)">
        <path
          d="M78 28h24v22c0 11 19 20 19 34v52c0 9-6 13-13 13H72c-8 0-13-5-13-13V84c0-14 19-23 19-34V28Z"
          fill="#dfede4"
          fillOpacity=".8"
          stroke="#668d7d"
          strokeWidth="1.5"
        />
        <path
          d="M80 26h20v-9H80z"
          fill="#c9a782"
          stroke="#937b5e"
          strokeWidth="1.4"
        />
        <path
          d="M76 31h28M66 83c0-12 19-20 19-31"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M80 80h24v49H80z" fill="#faf7ed" stroke="#c5bda8" />
        <path
          d="M80 81c-7-4-10-1-10 5v38c0 7 7 6 10 3V81Z"
          fill="#f0eadc"
          stroke="#c5bda8"
        />
        <path
          d="M86 92h11m-11 8h11m-11 8h8"
          stroke="#b3ad9b"
          strokeLinecap="round"
        />
        <path d="M75 139h30" stroke="#91af9f" strokeLinecap="round" />
      </g>
    </svg>
  );
}
export function OceanScene() {
  return (
    <svg
      className="ocean-scene"
      viewBox="0 0 1100 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#dde9e4" />
          <stop offset="1" stopColor="#c4d8cf" />
        </linearGradient>
        <linearGradient id="sky">
          <stop stopColor="#eaf0e7" />
          <stop offset="1" stopColor="#e1eae3" />
        </linearGradient>
      </defs>
      <path fill="url(#sky)" d="M0 0h1100v260H0z" />
      <circle cx="887" cy="69" r="27" fill="#f5f0d7" opacity=".9" />
      <path
        d="M0 170C190 165 250 167 430 165S760 155 1100 165V260H0Z"
        fill="#ccdfd6"
      />
      <path
        d="M0 198c180-15 267 6 420-6s220-15 420-4 217-7 260-2v74H0Z"
        fill="url(#sea)"
      />
      <path
        d="M0 224c143-10 234-11 364-2s214 14 385-2 261-7 351-1v41H0Z"
        fill="#b7d0c5"
        opacity=".6"
      />
      <path
        d="M681 201c42-2 89-2 135 1m75 15c38-3 79-1 113 1M446 229c62-3 112 3 163 1"
        stroke="#f7faf4"
        strokeWidth="1.5"
        opacity=".65"
      />
      <path
        d="M998 146c-32 2-73 8-109 15h211v-19Z"
        fill="#88a798"
        opacity=".4"
      />
      <path
        d="m753 69 6-3 6 3m34 22 5-3 5 3"
        stroke="#849c8e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g transform="translate(822 167) rotate(12)">
        <path
          d="M0 0h7v7l7 11v27c0 4-4 5-10 5s-10-1-10-5V18L0 7Z"
          fill="#f5f9ec"
          fillOpacity=".7"
          stroke="#688c7a"
        />
        <path d="M0-5h7v5H0Z" fill="#bda582" />
        <path d="M1 23h7v19H1z" fill="#f7efd9" />
      </g>
    </svg>
  );
}
