import type { IntakePhoto, PhotoKind } from "@/lib/domain/types";

/**
 * Illustrative stand-ins for customer photos.
 *
 * Drawn as SVG rather than shipped as stock images: nothing here is anyone's
 * copyrighted photograph, they stay crisp at any size, and they read as
 * deliberate demo assets instead of filler.
 */

function dataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s{2,}/g, " ").trim())}`;
}

const FRAME = {
  w: 800,
  h: 600,
};

function wrap(inner: string, bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FRAME.w} ${FRAME.h}" width="${FRAME.w}" height="${FRAME.h}" role="img">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#0f1722" stop-opacity="0.16"/>
      </linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8ecf1"/>
        <stop offset="42%" stop-color="#c3ccd6"/>
        <stop offset="60%" stop-color="#dfe5ec"/>
        <stop offset="100%" stop-color="#aab5c2"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.18"/>
        <stop offset="35%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <rect width="${FRAME.w}" height="${FRAME.h}" fill="url(#sky)"/>
    ${inner}
    <rect width="${FRAME.w}" height="${FRAME.h}" fill="url(#shade)"/>
  </svg>`;
}

const CONDENSER = wrap(
  `<rect x="70" y="470" width="660" height="90" fill="#8a8f7d" opacity="0.55"/>
   <rect x="70" y="470" width="660" height="10" fill="#6f745f" opacity="0.5"/>
   <ellipse cx="400" cy="492" rx="240" ry="26" fill="#000" opacity="0.18"/>
   <rect x="196" y="150" width="408" height="345" rx="14" fill="#9fa8b4"/>
   <rect x="196" y="150" width="408" height="345" rx="14" fill="none" stroke="#6b7280" stroke-width="4"/>
   <rect x="216" y="230" width="368" height="240" rx="6" fill="#7f8894"/>
   ${Array.from({ length: 22 }, (_, i) => `<line x1="222" y1="${240 + i * 10}" x2="578" y2="${240 + i * 10}" stroke="#68707c" stroke-width="3"/>`).join("")}
   <rect x="196" y="150" width="408" height="86" rx="10" fill="#b8c0ca"/>
   <circle cx="400" cy="193" r="62" fill="#5c646f"/>
   <circle cx="400" cy="193" r="54" fill="#464d57"/>
   ${Array.from({ length: 5 }, (_, i) => {
     const a = (i * 72 * Math.PI) / 180;
     return `<path d="M400 193 L${(400 + 50 * Math.cos(a)).toFixed(1)} ${(193 + 50 * Math.sin(a)).toFixed(1)} A50 50 0 0 1 ${(400 + 50 * Math.cos(a + 0.85)).toFixed(1)} ${(193 + 50 * Math.sin(a + 0.85)).toFixed(1)} Z" fill="#6d7580"/>`;
   }).join("")}
   <circle cx="400" cy="193" r="13" fill="#2f353d"/>
   <rect x="250" y="500" width="300" height="14" rx="4" fill="#767c6a" opacity="0.7"/>
   <rect x="604" y="300" width="36" height="120" rx="6" fill="#8b939e"/>
   <rect x="612" y="316" width="20" height="88" rx="3" fill="#6b7280"/>`,
  "#9db4cf",
);

const DATA_PLATE = wrap(
  `<rect x="100" y="70" width="600" height="460" rx="10" fill="#4a5159"/>
   <rect x="130" y="110" width="540" height="380" rx="6" fill="url(#metal)"/>
   <rect x="130" y="110" width="540" height="62" rx="6" fill="#2f3740"/>
   <rect x="156" y="132" width="150" height="18" rx="4" fill="#e6eaef" opacity="0.92"/>
   <rect x="330" y="134" width="96" height="14" rx="4" fill="#9aa3ad" opacity="0.75"/>
   ${[
     { y: 206, l: 110, v: 250 },
     { y: 248, l: 92, v: 300 },
     { y: 290, l: 128, v: 210 },
     { y: 332, l: 84, v: 268 },
     { y: 374, l: 116, v: 186 },
     { y: 416, l: 100, v: 236 },
   ]
     .map(
       (r) =>
         `<rect x="160" y="${r.y}" width="${r.l}" height="12" rx="3" fill="#5d6773" opacity="0.85"/>
          <rect x="310" y="${r.y}" width="${r.v}" height="12" rx="3" fill="#78838f" opacity="0.6"/>`,
     )
     .join("")}
   <rect x="470" y="404" width="176" height="62" rx="4" fill="#3b434c" opacity="0.86"/>
   ${Array.from({ length: 26 }, (_, i) => `<rect x="${480 + i * 6}" y="412" width="${i % 3 === 0 ? 3 : 2}" height="46" fill="#eef1f4" opacity="0.9"/>`).join("")}
   ${[
     [152, 128],
     [648, 128],
     [152, 472],
     [648, 472],
   ]
     .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#8d959e" stroke="#5b636c" stroke-width="2"/>`)
     .join("")}`,
  "#6a7480",
);

const LEAK = wrap(
  `<rect x="0" y="380" width="800" height="220" fill="#8d7a62"/>
   <rect x="0" y="380" width="800" height="12" fill="#6f5f4b"/>
   <rect x="80" y="60" width="640" height="330" rx="8" fill="#a8937a"/>
   <rect x="104" y="84" width="592" height="282" rx="6" fill="#2b2f35"/>
   <rect x="330" y="84" width="60" height="150" rx="8" fill="#c9d2da"/>
   <rect x="344" y="150" width="34" height="150" rx="10" fill="#b3bcc6"/>
   <path d="M361 300 q0 44 -34 58 l0 28" stroke="#9aa4ae" stroke-width="22" fill="none" stroke-linecap="round"/>
   <path d="M361 300 q0 44 34 58 l0 28" stroke="#9aa4ae" stroke-width="22" fill="none" stroke-linecap="round"/>
   <circle cx="327" cy="398" r="12" fill="#7f8892"/>
   <ellipse cx="318" cy="430" rx="9" ry="13" fill="#7fc4e8" opacity="0.95"/>
   <ellipse cx="316" cy="472" rx="6" ry="9" fill="#7fc4e8" opacity="0.8"/>
   <ellipse cx="330" cy="524" rx="132" ry="30" fill="#5fa9d6" opacity="0.55"/>
   <ellipse cx="330" cy="524" rx="92" ry="19" fill="#8ccdee" opacity="0.55"/>
   <rect x="120" y="330" width="180" height="36" rx="4" fill="#3a3f47" opacity="0.7"/>
   <rect x="470" y="300" width="190" height="66" rx="6" fill="#3a3f47" opacity="0.6"/>`,
  "#5d6a78",
);

const ART: Record<PhotoKind, string> = {
  equipment: CONDENSER,
  dataplate: DATA_PLATE,
  problem: LEAK,
};

const FILENAME: Record<PhotoKind, string> = {
  equipment: "outdoor-unit.jpg",
  dataplate: "model-plate.jpg",
  problem: "problem-area.jpg",
};

export const PHOTO_KIND_LABEL: Record<PhotoKind, string> = {
  equipment: "Equipment",
  problem: "Problem area",
  dataplate: "Model / serial plate",
};

export function placeholderPhoto(kind: PhotoKind, index = 0): IntakePhoto {
  const svg = ART[kind];
  return {
    id: `ph_${kind}_${index}`,
    kind,
    name: FILENAME[kind],
    dataUrl: dataUrl(svg),
    sizeBytes: 1_480_000 + index * 220_000,
    placeholder: true,
  };
}
