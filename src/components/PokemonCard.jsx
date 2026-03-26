import { useState } from "react";
import PokeBall from "./PokeBall";
import SparkleIcon from "./SparkleIcon";

const typeColors = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};
 
const typeEmoji = {
  fire: "🔥", water: "💧", grass: "🌿", electric: "⚡", ice: "❄️",
  fighting: "🥊", poison: "☠️", ground: "🌍", flying: "🌬️", psychic: "🔮",
  bug: "🐛", rock: "🪨", ghost: "👻", dragon: "🐉", dark: "🌑",
  steel: "⚙️", fairy: "✨", normal: "⭐",
};

export default function PokemonCard({ pokemon, caught, shiny, onToggleCaught, onToggleShiny }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const mainType = pokemon.types[0];
  const color = typeColors[mainType];
 
  return (
    <div className={`poke-card ${caught ? "caught" : ""} ${shiny ? "shiny" : ""}`}
      style={{ "--type-color": color }}
    >
      
      
      <div className="card-header">
        <div className="card-header-id">
          <span className="poke-number">#{String(pokemon.id).padStart(3, "0")}</span>
          <div>
            {shiny && <div className="icon-animation">✨</div>}
            {caught && <div className="icon-animation"><PokeBall size={"1.2rem"}/></div>}
          </div>
        </div>
        <div className="type-badges">
          {pokemon.types.map(t => (
            <span key={t} className="type-badge" style={{ background: typeColors[t] + "cc" }}>
              {typeEmoji[t]} {t}
            </span>
          ))}
        </div>
      </div>
 
      <div className="poke-img-wrap">
        {!imgLoaded && <div className="img-placeholder"><PokeBall size={40}/></div>}
        <img
          src={shiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
          className="poke-img"
        />
      </div>
 
      <div className="poke-name">{pokemon.name}</div>
 
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
    </div>
  );
}