import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { translateBiomes } from "../data/biomeTranslations";
import spawnsData from "../data/spawns.json";

const BUCKET_LABELS = {
  "common":     { label: "Común",      color: "#78C850" },
  "uncommon":   { label: "Poco común", color: "#6890F0" },
  "rare":       { label: "Raro",       color: "#C03028" },
  "ultra-rare": { label: "Ultra raro", color: "#A040A0" },
};

const TIME_LABELS    = { any: "Cualquiera", day: "Día", night: "Noche", dawn: "Amanecer", dusk: "Atardecer" };
const WEATHER_LABELS = { any: "Cualquiera", clear: "Despejado", rain: "Lluvia", thunder: "Tormenta" };
const CONTEXT_LABELS = { grounded: "Superficie", submerged: "Bajo el agua", surface: "Superficie acuática", fishing: "Pescando" };

// Pokémon with id > 1025 in your JSON are regional variants/forms.
// The CSV only has pokedex IDs 1-1025, so we need to map variant IDs
// back to their base pokedex ID. This covers all regional forms in your JSON.
const VARIANT_BASE_ID = {
  // Rattata/Raticate Alolan
  1116: 19, 1117: 20, 1118: 20,
  // Raichu Alolan
  1125: 26,
  // Sandshrew/Sandslash Alolan
  1126: 27, 1127: 28,
  // Vulpix/Ninetales Alolan
  1128: 37, 1129: 38,
  // Diglett/Dugtrio Alolan
  1130: 50, 1131: 51,
  // Meowth/Persian Alolan & Galarian
  1132: 52, 1133: 53, 1186: 52,
  // Geodude/Graveler/Golem Alolan
  1134: 74, 1135: 75, 1136: 76,
  // Grimer/Muk Alolan
  1137: 88, 1138: 89,
  // Exeggutor Alolan
  1139: 103,
  // Marowak Alolan
  1140: 105, 1174: 105,
  // Ponyta/Rapidash Galarian
  1187: 77, 1188: 78,
  // Slowpoke/Slowbro/Slowking Galarian
  1189: 79, 1190: 80, 1197: 199,
  // Farfetch'd Galarian
  1191: 83,
  // Weezing Galarian
  1192: 110,
  // Mr. Mime Galarian
  1193: 122,
  // Corsola Galarian
  1198: 222,
  // Zigzagoon/Linoone Galarian
  1199: 263, 1200: 264,
  // Darumaka/Darmanitan Galarian
  1201: 554, 1202: 555, 1203: 555,
  // Yamask Galarian
  1204: 562,
  // Stunfisk Galarian
  1205: 618,
  // Voltorb/Electrode Hisuian
  1256: 100, 1257: 101,
  // Typhlosion Hisuian
  1258: 157,
  // Qwilfish Hisuian
  1259: 211,
  // Sneasel Hisuian
  1260: 215,
  // Samurott Hisuian
  1261: 503,
  // Lilligant Hisuian
  1262: 549,
  // Zorua/Zoroark Hisuian
  1263: 570, 1264: 571,
  // Braviary Hisuian
  1265: 628,
  // Sliggoo/Goodra Hisuian
  1266: 705, 1267: 706,
  // Avalugg Hisuian
  1268: 712,
  // Decidueye Hisuian
  1269: 724,
  // Growlithe/Arcanine Hisuian
  1254: 58, 1255: 59,
  // Wooper Paldean
  1278: 194,
  // Tauros Paldean
  1275: 128, 1276: 128, 1277: 128,
  // Greninja Battle Bond / Ash
  1141: 658, 1142: 658,
  // Deoxys forms
  1026: 386, 1027: 386, 1028: 386,
  // Mega evolutions — use base pokemon
  1058: 3, 1059: 6, 1060: 6, 1061: 9, 1062: 65, 1063: 94,
};

function SpawnRow({ entry }) {
  const bucket  = BUCKET_LABELS[entry.bucket] ?? { label: entry.bucket, color: "#aaa" };
  const biomes  = translateBiomes(entry.biomes);
  const excluded = translateBiomes(entry.excludedBiomes);
  const time    = TIME_LABELS[entry.time]    ?? entry.time;
  const weather = WEATHER_LABELS[entry.weather] ?? entry.weather;
  const context = CONTEXT_LABELS[entry.context] ?? entry.context;

  return (
    <div className="spawn-row">
      {entry.variant && (
        <div className="spawn-variant">Variante: {entry.variant}</div>
      )}
      <div className="spawn-row-grid">
        <div className="spawn-field">
          <span className="spawn-label">Rareza</span>
          <span className="spawn-bucket" style={{ background: bucket.color + "33", color: bucket.color, borderColor: bucket.color + "66" }}>
            {bucket.label}
          </span>
        </div>
        <div className="spawn-field">
          <span className="spawn-label">Momento</span>
          <span className="spawn-value">{time}</span>
        </div>
        <div className="spawn-field">
          <span className="spawn-label">Clima</span>
          <span className="spawn-value">{weather}</span>
        </div>
        <div className="spawn-field">
          <span className="spawn-label">Contexto</span>
          <span className="spawn-value">{context}</span>
        </div>
      </div>
      {biomes && (
        <div className="spawn-biomes">
          <span className="spawn-label">Biomas</span>
          <span className="spawn-value">{biomes}</span>
        </div>
      )}
      {excluded && (
        <div className="spawn-biomes excluded">
          <span className="spawn-label">Excluidos</span>
          <span className="spawn-value">{excluded}</span>
        </div>
      )}
      {entry.presets && (
        <div className="spawn-biomes">
          <span className="spawn-label">Presets</span>
          <span className="spawn-value">{entry.presets}</span>
        </div>
      )}
      {entry.multipliers && (
        <div className="spawn-biomes">
          <span className="spawn-label">Modificadores</span>
          <span className="spawn-value">{entry.multipliers}</span>
        </div>
      )}
      {entry.conditions && (
        <div className="spawn-biomes">
          <span className="spawn-label">Condiciones</span>
          <span className="spawn-value">{entry.conditions}</span>
        </div>
      )}
      {entry.anticonditions && (
        <div className="spawn-biomes">
          <span className="spawn-label">Anti-condiciones</span>
          <span className="spawn-value">{entry.anticonditions}</span>
        </div>
      )}
    </div>
  );
}

function SpawnPopup({ entries, pokemonName, anchorRef, onClose }) {
  const [coords, setCoords] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({ top: rect.top + window.scrollY - 8, left: rect.left + rect.width / 2 + window.scrollX });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!coords) return null;

  return ReactDOM.createPortal(
    <div ref={popupRef} className="spawn-popup" style={{ position: "absolute", top: coords.top, left: coords.left, transform: "translate(-50%, -100%)", zIndex: 9999 }}>
      <div className="spawn-popup-header">
        <span>🌍 Spawns de {pokemonName}</span>
        <button className="spawn-close" onClick={onClose}>✕</button>
      </div>
      <div className="spawn-popup-body">
        {entries.map((entry, i) => <SpawnRow key={i} entry={entry} />)}
      </div>
      <div className="spawn-popup-arrow" />
    </div>,
    document.body
  );
}

export default function SpawnInfo({ pokemon }) {
  const [showSpawn, setShowSpawn] = useState(false);
  const btnRef = useRef(null);

  // Look up by ID directly, fallback to base ID for regional variants
  const lookupId = String(VARIANT_BASE_ID[pokemon.id] ?? pokemon.id);
  const entries = spawnsData[lookupId];

  if (!entries || entries.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        className={`action-btn spawn-btn ${showSpawn ? "active" : ""}`}
        onClick={() => setShowSpawn(p => !p)}
        title="Ver biomas de spawn en Cobblemon"
      >
        🌍 Spawns
      </button>
      {showSpawn && (
        <SpawnPopup entries={entries} pokemonName={pokemon.name} anchorRef={btnRef} onClose={() => setShowSpawn(false)} />
      )}
    </>
  );
}
