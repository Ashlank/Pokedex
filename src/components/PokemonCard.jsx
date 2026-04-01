import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import PokeBall from "./PokeBall";
import SparkleIcon from "./SparkleIcon";
import { TYPE_COLORS, TYPE_EMOJI, getWeaknesses } from "../data/typeChart";
import pokemons from "../data/pokemon.json";

const pokemonById = Object.fromEntries(pokemons.map((p) => [p.id, p]));

function EvoArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Portal tooltip — se renderiza en document.body, escapa del overflow hidden
function EvoTooltip({ chain, currentId, anchorRef, onClose }) {
  const [coords, setCoords] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + window.scrollY - 10,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  if (!coords) return null;

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className="evo-tooltip"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      }}
    >
      <div className="evo-tooltip-inner">
        {chain.map((id, i) => {
          const p = pokemonById[id];
          if (!p) return null;
          return (
            <div key={id} className="evo-tooltip-chain">
              <div className={`evo-mon ${id === currentId ? "evo-current" : ""}`}>
                <img src={p.sprite} alt={p.name} className="evo-img" loading="lazy" />
                <span className="evo-name">{p.name}</span>
              </div>
              {i < chain.length - 1 && (
                <div className="evo-arrow"><EvoArrow /></div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

function WeaknessPanel({ types }) {
  const weaknesses = getWeaknesses(types);

  if (weaknesses.length === 0) {
    return (
      <div className="weakness-panel">
        <div className="weakness-title">⚔️ Sin debilidades</div>
      </div>
    );
  }

  const x4 = weaknesses.filter((w) => w.multiplier >= 4);
  const x2 = weaknesses.filter((w) => w.multiplier === 2);

  return (
    <div className="weakness-panel">
      <div className="weakness-title">⚔️ Debilidades</div>
      {x4.length > 0 && (
        <div className="weakness-group">
          <span className="weakness-mult x4">×4</span>
          <div className="weakness-types">
            {x4.map(({ type }) => (
              <span key={type} className="weakness-badge" style={{ background: TYPE_COLORS[type] + "dd" }}>
                {TYPE_EMOJI[type]} {type}
              </span>
            ))}
          </div>
        </div>
      )}
      {x2.length > 0 && (
        <div className="weakness-group">
          <span className="weakness-mult x2">×2</span>
          <div className="weakness-types">
            {x2.map(({ type }) => (
              <span key={type} className="weakness-badge" style={{ background: TYPE_COLORS[type] + "dd" }}>
                {TYPE_EMOJI[type]} {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PokemonCard({ pokemon, caught, shiny, onToggleCaught, onToggleShiny }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showEvo, setShowEvo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const evoBtnRef = useRef(null);

  const mainType = pokemon.types[0];
  const color = TYPE_COLORS[mainType];
  const hasEvolutions = pokemon.evolutionChain && pokemon.evolutionChain.length > 1;

  return (
    <div
      className={`poke-card ${caught ? "caught" : ""} ${shiny ? "shiny" : ""} ${expanded ? "expanded" : ""}`}
      style={{ "--type-color": color }}
    >
      <div className="card-header">
        <div className="card-header-id">
          <span className="poke-number">#{String(pokemon.id).padStart(3, "0")}</span>
          <div>
            {shiny && <div className="icon-animation">✨</div>}
            {caught && <div className="icon-animation"><PokeBall size={"1.2rem"} /></div>}
          </div>
        </div>
        <div className="type-badges">
          {pokemon.types.map((t) => (
            <span key={t} className="type-badge" style={{ background: TYPE_COLORS[t] + "cc" }}>
              {TYPE_EMOJI[t]} {t}
            </span>
          ))}
        </div>
      </div>

      <div className="poke-img-wrap">
        {!imgLoaded && <div className="img-placeholder"><PokeBall size={40} /></div>}
        <img
          src={shiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
          className="poke-img"
        />
      </div>

      <div className="poke-name">{pokemon.name}</div>

      {/* Panel de debilidades */}
      <div className={`weakness-wrap ${expanded ? "open" : ""}`}>
        <WeaknessPanel types={pokemon.types} />
      </div>

      <div className="card-actions">
        <button
          className={`action-btn caught-btn ${caught ? "active" : ""}`}
          onClick={() => onToggleCaught(pokemon.id)}
          title={caught ? "¡Atrapado!" : "Marcar como atrapado"}
        >
          <PokeBall size={14} />
          {caught ? "¡Atrapado!" : "Atrapar"}
        </button>
        <button
          className={`action-btn shiny-btn ${shiny ? "active" : ""}`}
          onClick={() => onToggleShiny(pokemon.id)}
          title={shiny ? "Tenés versión shiny" : "Marcar como shiny"}
        >
          <SparkleIcon />
          Shiny
        </button>

      </div>

      {hasEvolutions && (
        <>
          <button
            ref={evoBtnRef}
            className={`action-btn evo-btn evo-btn-wrap ${showEvo ? "active" : ""}`}
            onClick={() => setShowEvo((p) => !p)}
            title="Ver cadena de evolución"
          >
            ⟳ Evol
          </button>
          {showEvo && (
            <EvoTooltip
              chain={pokemon.evolutionChain}
              currentId={pokemon.id}
              anchorRef={evoBtnRef}
              onClose={() => setShowEvo(false)}
            />
          )}
        </>
      )}

      <button
        className="expand-hint"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
        aria-label={expanded ? "Ocultar debilidades" : "Ver debilidades"}
      >
        {expanded ? "↑ Ocultar debilidades" : "↓ Ver debilidades"}
      </button>
    </div>
  );
}