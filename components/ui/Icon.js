// components/ui/Icon.js
// Bespoke ikon sistemi. Çizilmiş glyph'ler özel render edilir; tanımsız isimler
// güvenle Ionicons'a düşer (kademeli %100 bespoke). Anahtarlar Ionicons isimleriyle
// aynı tutulur ki ekranlarda <Ionicons> → <Icon> geçişi isim-koruyarak yapılabilsin.
import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/theme";

// Her glyph, stroke'u Svg'den miras alan iç elemanları döndürür.
// Dolu elemanlarda fill={c} stroke="none" verilir.
const GLYPHS = {
  "arrow-back": () => <Path d="M19 12 H5 M11 6 L5 12 L11 18" />,
  "chevron-back": () => <Polyline points="15,5 8,12 15,19" />,
  "chevron-forward": () => <Polyline points="9,5 16,12 9,19" />,
  "ellipsis-vertical": (c) => (
    <>
      <Circle cx="12" cy="5" r="1.6" fill={c} stroke="none" />
      <Circle cx="12" cy="12" r="1.6" fill={c} stroke="none" />
      <Circle cx="12" cy="19" r="1.6" fill={c} stroke="none" />
    </>
  ),
  "ellipsis-horizontal": (c) => (
    <>
      <Circle cx="5" cy="12" r="1.6" fill={c} stroke="none" />
      <Circle cx="12" cy="12" r="1.6" fill={c} stroke="none" />
      <Circle cx="19" cy="12" r="1.6" fill={c} stroke="none" />
    </>
  ),
  "search": () => (
    <>
      <Circle cx="11" cy="11" r="6.5" />
      <Line x1="16" y1="16" x2="20.5" y2="20.5" />
    </>
  ),
  "search-outline": () => GLYPHS.search(),
  "scan-outline": () => (
    <>
      <Path d="M4 8 V6 a2 2 0 0 1 2-2 H8" />
      <Path d="M16 4 H18 a2 2 0 0 1 2 2 V8" />
      <Path d="M20 16 V18 a2 2 0 0 1 -2 2 H16" />
      <Path d="M8 20 H6 a2 2 0 0 1 -2 -2 V16" />
      <Line x1="6.5" y1="12" x2="17.5" y2="12" />
    </>
  ),
  "qr-code-outline": (c) => (
    <>
      <Rect x="4" y="4" width="6" height="6" rx="1.6" />
      <Rect x="14" y="4" width="6" height="6" rx="1.6" />
      <Rect x="4" y="14" width="6" height="6" rx="1.6" />
      <Rect x="14" y="14" width="2.6" height="2.6" rx="0.6" fill={c} stroke="none" />
      <Rect x="17.4" y="17.4" width="2.6" height="2.6" rx="0.6" fill={c} stroke="none" />
      <Rect x="17.4" y="14" width="2.6" height="2.6" rx="0.6" fill={c} stroke="none" />
      <Rect x="14" y="17.4" width="2.6" height="2.6" rx="0.6" fill={c} stroke="none" />
    </>
  ),
  "share-social-outline": () => (
    <>
      <Circle cx="6" cy="12" r="2.6" />
      <Circle cx="18" cy="6" r="2.6" />
      <Circle cx="18" cy="18" r="2.6" />
      <Line x1="8.3" y1="10.8" x2="15.7" y2="7.2" />
      <Line x1="8.3" y1="13.2" x2="15.7" y2="16.8" />
    </>
  ),
  "person-add-outline": () => (
    <>
      <Circle cx="9" cy="8" r="3.2" />
      <Path d="M3.5 19 a5.5 5.5 0 0 1 11 0" />
      <Line x1="18" y1="7" x2="18" y2="13" />
      <Line x1="15" y1="10" x2="21" y2="10" />
    </>
  ),
  "camera": () => (
    <>
      <Path d="M4 8 h3 l1.5 -2 h7 l1.5 2 h2 a1.5 1.5 0 0 1 1.5 1.5 V18 a1.5 1.5 0 0 1 -1.5 1.5 H4 a1.5 1.5 0 0 1 -1.5 -1.5 V9.5 A1.5 1.5 0 0 1 4 8 Z" />
      <Circle cx="12" cy="13" r="3.4" />
    </>
  ),
  "camera-reverse": () => GLYPHS.camera(),
  "images-outline": () => (
    <>
      <Rect x="7" y="3" width="14" height="14" rx="2.5" />
      <Circle cx="11" cy="7.5" r="1.4" />
      <Path d="M21 13 l-4 -3 -6 5" />
      <Path d="M17 21 H5 a2 2 0 0 1 -2 -2 V7" />
    </>
  ),
  "folder-outline": () => (
    <Path d="M3 8 a2 2 0 0 1 2-2 H9 l2 2 H19 a2 2 0 0 1 2 2 V17 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z" />
  ),
  "folder-open-outline": () => GLYPHS["folder-outline"](),
  "star": (c) => (
    <Path
      d="M12 3.5 L14.12 9.09 L20.08 9.37 L15.42 13.11 L17 18.88 L12 15.6 L7 18.88 L8.58 13.11 L3.92 9.37 L9.88 9.09 Z"
      fill={c}
      stroke="none"
    />
  ),
  "star-outline": () => (
    <Path d="M12 3.5 L14.12 9.09 L20.08 9.37 L15.42 13.11 L17 18.88 L12 15.6 L7 18.88 L8.58 13.11 L3.92 9.37 L9.88 9.09 Z" />
  ),
  "mic": () => (
    <>
      <Rect x="9" y="3" width="6" height="11" rx="3" />
      <Path d="M6 11 a6 6 0 0 0 12 0" />
      <Line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  "play-circle": (c) => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M10 8.5 L16 12 L10 15.5 Z" fill={c} stroke="none" />
    </>
  ),
  "pause-circle": () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="10" y1="9" x2="10" y2="15" />
      <Line x1="14" y1="9" x2="14" y2="15" />
    </>
  ),
  "trash-outline": () => (
    <>
      <Line x1="4" y1="6.5" x2="20" y2="6.5" />
      <Path d="M9 6.5 V5 a1 1 0 0 1 1 -1 H14 a1 1 0 0 1 1 1 V6.5" />
      <Path d="M6 6.5 L7 19 a1.5 1.5 0 0 0 1.5 1.5 H15.5 A1.5 1.5 0 0 0 17 19 L18 6.5" />
    </>
  ),
  "create-outline": () => (
    <>
      <Path d="M16 4.5 l3.5 3.5 -10 10 H6 V14.5 Z" />
      <Line x1="14" y1="6.5" x2="17.5" y2="10" />
    </>
  ),
  "mail-outline": () => (
    <>
      <Rect x="3" y="6" width="18" height="12" rx="2.5" />
      <Path d="M4 8 L12 13 L20 8" />
    </>
  ),
  "call": () => (
    <Path d="M6.5 4 H9 l1.5 4 -2 1.5 a11 11 0 0 0 5 5 L15 12.5 L19 14 V16.5 a2 2 0 0 1 -2 2 A14 14 0 0 1 4.5 6 A2 2 0 0 1 6.5 4 Z" />
  ),
  "call-outline": () => GLYPHS.call(),
  "business-outline": () => (
    <>
      <Rect x="5" y="4" width="14" height="16" rx="1.5" />
      <Line x1="9" y1="8" x2="10" y2="8" />
      <Line x1="14" y1="8" x2="15" y2="8" />
      <Line x1="9" y1="12" x2="10" y2="12" />
      <Line x1="14" y1="12" x2="15" y2="12" />
      <Line x1="10.5" y1="20" x2="10.5" y2="16" />
      <Line x1="13.5" y1="20" x2="13.5" y2="16" />
    </>
  ),
  "briefcase-outline": () => (
    <>
      <Rect x="3" y="7.5" width="18" height="12" rx="2" />
      <Path d="M9 7.5 V6 a1.5 1.5 0 0 1 1.5 -1.5 H13.5 A1.5 1.5 0 0 1 15 6 V7.5" />
      <Line x1="3" y1="12.5" x2="21" y2="12.5" />
    </>
  ),
  "globe-outline": () => (
    <>
      <Circle cx="12" cy="12" r="8.5" />
      <Line x1="3.5" y1="12" x2="20.5" y2="12" />
      <Path d="M12 3.5 a13 13 0 0 1 0 17 a13 13 0 0 1 0 -17" />
    </>
  ),
  "location-outline": () => (
    <>
      <Path d="M12 21 c4 -5 6 -8 6 -11 a6 6 0 0 0 -12 0 c0 3 2 6 6 11 Z" />
      <Circle cx="12" cy="10" r="2.3" />
    </>
  ),
  "person": (c) => (
    <>
      <Circle cx="12" cy="8" r="3.6" fill={c} stroke="none" />
      <Path d="M5 20 a7 7 0 0 1 14 0 Z" fill={c} stroke="none" />
    </>
  ),
  "person-outline": () => (
    <>
      <Circle cx="12" cy="8" r="3.6" />
      <Path d="M5 20 a7 7 0 0 1 14 0" />
    </>
  ),
  "home-outline": () => (
    <>
      <Path d="M4 11 L12 4 L20 11" />
      <Path d="M6 10 V19 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V10" />
    </>
  ),
  "add": () => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  "add-circle-outline": () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="8" x2="12" y2="16" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  "checkmark-circle": () => (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Polyline points="8,12.5 11,15.5 16,9" />
    </>
  ),
  "close-outline": () => (
    <>
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  "stats-chart-outline": (c, sw) => (
    <>
      <Line x1="6" y1="20" x2="6" y2="13" strokeWidth={sw + 0.6} />
      <Line x1="12" y1="20" x2="12" y2="7" strokeWidth={sw + 0.6} />
      <Line x1="18" y1="20" x2="18" y2="15" strokeWidth={sw + 0.6} />
    </>
  ),
  "bar-chart-outline": (c, sw) => GLYPHS["stats-chart-outline"](c, sw),
  "settings-outline": (c) => (
    <>
      <Line x1="4" y1="8" x2="20" y2="8" />
      <Circle cx="9" cy="8" r="2.4" fill={c} stroke="none" />
      <Circle cx="9" cy="8" r="2.4" />
      <Line x1="4" y1="16" x2="20" y2="16" />
      <Circle cx="15" cy="16" r="2.4" fill={c} stroke="none" />
      <Circle cx="15" cy="16" r="2.4" />
    </>
  ),
};

export default function Icon({ name, size = 24, color, strokeWidth = 1.75, style, ...rest }) {
  const { colors } = useTheme();
  const c = color || colors.text;
  const glyph = GLYPHS[name];

  if (!glyph) {
    // Henüz bespoke olmayan isimler güvenle Ionicons'a düşer
    return <Ionicons name={name} size={size} color={c} style={style} {...rest} />;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {glyph(c, strokeWidth)}
    </Svg>
  );
}
