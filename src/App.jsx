import { useState, useEffect, useCallback, useRef } from "react";
 
const TOTAL_POKEMON = 1025;
const PAGE_SIZE = 40;
 
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
 
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}
 
function PokeBall({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.1"/>
      <path d="M1 20 Q1 1 20 1 Q39 1 39 20Z" fill="currentColor" fillOpacity="0.7"/>
      <rect x="1" y="18" width="38" height="4" fill="currentColor"/>
      <circle cx="20" cy="20" r="6" fill="white" stroke="currentColor" strokeWidth="2"/>
      <circle cx="20" cy="20" r="3" fill="currentColor"/>
    </svg>
  );
}
 
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}
 
function PokemonCard({ pokemon, caught, shiny, onToggleCaught, onToggleShiny }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const mainType = pokemon.types?.[0] || "normal";
  const color = typeColors[mainType] || "#A8A878";
 
  return (
    <div className={`poke-card ${caught ? "caught" : ""} ${shiny ? "shiny" : ""}`}
      style={{ "--type-color": color }}>
      
      {shiny && <div className="shiny-sparkles">✨</div>}
      
      <div className="card-header">
        <span className="poke-number">#{String(pokemon.id).padStart(3, "0")}</span>
        <div className="type-badges">
          {pokemon.types?.map(t => (
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
 
export default function Pokedex() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [displayedPokemon, setDisplayedPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [caught, setCaught] = useLocalStorage("pokedex_caught", {});
  const [shiny, setShiny] = useLocalStorage("pokedex_shiny", {});
  const [activeFilter, setActiveFilter] = useState(null); // null | "caught" | "shiny"
  const loaderRef = useRef(null);
  const cacheRef = useRef({});
 
  // Load list of all pokemon
  useEffect(() => {
    async function loadList() {
      setLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}&offset=0`);
        const data = await res.json();
        const list = data.results.map((p, i) => ({
          id: i + 1,
          name: p.name.replace(/-/g, " "),
          rawName: p.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
          shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${i + 1}.png`,
          types: null,
        }));
        setAllPokemon(list);
        setDisplayedPokemon(list.slice(0, PAGE_SIZE));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadList();
  }, []);
 
  // Fetch types for visible pokemon (batch, lazy)
  useEffect(() => {
    const toFetch = displayedPokemon.filter(p => !cacheRef.current[p.id]);
    if (!toFetch.length) return;
 
    let cancelled = false;
    async function fetchTypes() {
      await Promise.all(toFetch.map(async (p) => {
        try {
          const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
          const d = await r.json();
          cacheRef.current[p.id] = d.types.map(t => t.type.name);
        } catch {}
      }));
      if (!cancelled) {
        setDisplayedPokemon(prev => prev.map(p => ({
          ...p,
          types: cacheRef.current[p.id] || p.types
        })));
      }
    }
    fetchTypes();
    return () => { cancelled = true; };
  }, [displayedPokemon.length]);
 
  // Search + active filter logic
  const baseList = (() => {
    if (activeFilter === "caught") return allPokemon.filter(p => caught[p.id]);
    if (activeFilter === "shiny") return allPokemon.filter(p => shiny[p.id]);
    return null;
  })();
 
  const filtered = search.trim()
    ? (baseList || allPokemon).filter(p =>
        p.name.includes(search.toLowerCase()) ||
        String(p.id).includes(search.trim())
      )
    : baseList;
 
  const visibleList = filtered || displayedPokemon;
 
  const toggleFilter = (name) => {
    setActiveFilter(prev => prev === name ? null : name);
    setSearch("");
  };
 
  // Infinite scroll
  useEffect(() => {
    if (search.trim() || activeFilter || !loaderRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && displayedPokemon.length < allPokemon.length) {
        setLoadingMore(true);
        setTimeout(() => {
          const next = allPokemon.slice(0, displayedPokemon.length + PAGE_SIZE);
          setDisplayedPokemon(next);
          setLoadingMore(false);
        }, 200);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [search, loadingMore, displayedPokemon.length, allPokemon.length]);
 
  const toggleCaught = useCallback((id) => {
    setCaught(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setCaught]);
 
  const toggleShiny = useCallback((id) => {
    setShiny(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setShiny]);
 
  const caughtCount = Object.values(caught).filter(Boolean).length;
  const shinyCount = Object.values(shiny).filter(Boolean).length;
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lilita+One&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          background: #fef6ff;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
        }
 
        .app {
          min-height: 100vh;
          background: 
            radial-gradient(ellipse at 10% 10%, #ffd6f0 0%, transparent 50%),
            radial-gradient(ellipse at 90% 5%, #d6f0ff 0%, transparent 45%),
            radial-gradient(ellipse at 50% 95%, #fff0d6 0%, transparent 50%),
            #fef6ff;
        }
 
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(20px);
          background: rgba(255,246,255,0.85);
          border-bottom: 2px solid #f9c6e8;
          padding: 16px 24px;
          box-shadow: 0 4px 24px rgba(255,150,220,0.15);
        }
 
        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
        }
 
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }
 
        .logo {
          font-family: 'Lilita One', cursive;
          font-size: 2rem;
          background: linear-gradient(135deg, #ff6eb4, #ff9d6b, #ffd86e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
 
        .logo-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          -webkit-text-fill-color: #ff8cc8;
          letter-spacing: 3px;
          text-transform: uppercase;
          display: block;
          margin-top: -4px;
          margin-left: 60px;
          text-align: start;
        }
 
        .stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
 
        .stat-pill {
          background: white;
          border: 2px solid;
          border-radius: 999px;
          padding: 6px 14px;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-family: 'Nunito', sans-serif;
          cursor: default;
          transition: all 0.15s;
        }
 
        button.stat-pill { cursor: pointer; }
        button.stat-pill:hover { transform: scale(1.05); }
 
        .stat-pill.caught-pill { border-color: #ff6eb4; color: #ff6eb4; }
        .stat-pill.caught-pill.active { background: #ff6eb4; color: white; box-shadow: 0 2px 12px rgba(255,110,180,0.4); }
 
        .stat-pill.shiny-pill { border-color: #ffd86e; color: #d4a000; }
        .stat-pill.shiny-pill.active { background: linear-gradient(135deg, #ffd86e, #ffb347); color: white; box-shadow: 0 2px 12px rgba(255,200,50,0.4); }
 
        .stat-pill.total-pill { border-color: #b8b8ff; color: #7070e0; }
 
        .search-wrap {
          position: relative;
        }
 
        .search-input {
          width: 100%;
          padding: 12px 20px 12px 48px;
          border-radius: 999px;
          border: 2.5px solid #f9c6e8;
          background: white;
          font-family: 'Nunito', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(255,150,220,0.1);
        }
 
        .search-input:focus {
          border-color: #ff6eb4;
          box-shadow: 0 0 0 4px rgba(255,110,180,0.12);
        }
 
        .search-input::placeholder { color: #ccc; }
 
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          pointer-events: none;
        }
 
        .main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 20px 60px;
        }
 
        .result-info {
          text-align: center;
          color: #999;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
 
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 18px;
        }
 
        .poke-card {
          background: white;
          border-radius: 24px;
          padding: 16px;
          border: 2.5px solid #f0e0f8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
          cursor: default;
        }
 
        .poke-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--type-color, #A8A878)22 0%, transparent 60%);
          pointer-events: none;
        }
 
        .poke-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
          border-color: var(--type-color, #ddd);
        }
 
        .poke-card.caught {
          border-color: #ff6eb4;
          background: linear-gradient(135deg, #fff0f8, white);
        }
 
        .poke-card.shiny {
          border-color: #ffd86e;
          background: linear-gradient(135deg, #fffbee, white);
          box-shadow: 0 4px 20px rgba(255,200,50,0.2);
        }
 
        .shiny-sparkles {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 1.2rem;
          animation: sparkle 1.5s ease-in-out infinite;
          z-index: 2;
        }
 
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.3) rotate(15deg); }
        }
 
        .card-header {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 4px;
        }
 
        .poke-number {
          font-weight: 800;
          font-size: 0.75rem;
          color: #bbb;
          letter-spacing: 1px;
        }
 
        .type-badges {
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
 
        .type-badge {
          font-size: 0.6rem;
          font-weight: 800;
          color: white;
          padding: 2px 6px;
          border-radius: 999px;
          text-transform: capitalize;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          letter-spacing: 0.5px;
        }
 
        .poke-img-wrap {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 4px 0;
        }
 
        .img-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ddd;
          animation: pulse 1.5s ease-in-out infinite;
        }
 
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
 
        .poke-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: opacity 0.3s;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
 
        .poke-card:hover .poke-img {
          transform: scale(1.05);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
          transition: transform 0.2s, filter 0.2s, opacity 0.3s;
        }
 
        .poke-name {
          font-weight: 800;
          font-size: 0.95rem;
          text-align: center;
          color: #444;
          text-transform: capitalize;
          margin-bottom: 12px;
          letter-spacing: 0.3px;
        }
 
        .card-actions {
          display: flex;
          gap: 6px;
        }
 
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 7px 4px;
          border-radius: 12px;
          border: 2px solid;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.3px;
        }
 
        .caught-btn {
          border-color: #f0d0e8;
          background: #fdf5fb;
          color: #d080b0;
        }
 
        .caught-btn:hover {
          border-color: #ff6eb4;
          background: #fff0f8;
          color: #ff6eb4;
          transform: scale(1.05);
        }
 
        .caught-btn.active {
          border-color: #ff6eb4;
          background: #ff6eb4;
          color: white;
          box-shadow: 0 2px 8px rgba(255,110,180,0.35);
        }
 
        .shiny-btn {
          border-color: #f0e8c0;
          background: #fdfaf0;
          color: #c0a000;
        }
 
        .shiny-btn:hover {
          border-color: #ffd86e;
          background: #fffbdd;
          color: #d4a000;
          transform: scale(1.05);
        }
 
        .shiny-btn.active {
          border-color: #ffd86e;
          background: linear-gradient(135deg, #ffd86e, #ffb347);
          color: white;
          box-shadow: 0 2px 8px rgba(255,200,50,0.4);
        }
 
        .loader {
          text-align: center;
          padding: 40px;
          color: #ccc;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
 
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
          color: #ff6eb4;
        }
 
        .loading-ball {
          animation: bounce 0.8s ease-in-out infinite alternate;
        }
 
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-20px); }
        }
 
        .loading-text {
          font-weight: 800;
          font-size: 1.1rem;
          color: #ff8cc8;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
 
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #ccc;
        }
 
        .no-results-emoji { font-size: 4rem; margin-bottom: 16px; }
        .no-results-text { font-weight: 800; font-size: 1.1rem; color: #bbb; }
 
        .scroll-sentinel { height: 1px; }
 
        @media (max-width: 600px) {
          .header { padding: 12px 16px; }
          .logo { font-size: 1.5rem; }
          .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
          .main { padding: 20px 12px 60px; }
        }
      `}</style>
 
      <div className="app">
        <div className="header">
          <div className="header-inner">
            <div className="header-top">
              <div>
                <div className="logo">
                  <img src="../public/favicon.png" alt="Pokédex" width='50' height='50' />
                  Pokédex
                </div>
                <span className="logo-sub">By Ashlank</span>
              </div>
              <div className="stats">
                <button
                  className={`stat-pill caught-pill ${activeFilter === "caught" ? "active" : ""}`}
                  onClick={() => toggleFilter("caught")}
                  title="Filtrar atrapados"
                >
                  <PokeBall size={14}/> {caughtCount} atrapados
                </button>
                <button
                  className={`stat-pill shiny-pill ${activeFilter === "shiny" ? "active" : ""}`}
                  onClick={() => toggleFilter("shiny")}
                  title="Filtrar shinies"
                >
                  <SparkleIcon/> {shinyCount} shinies
                </button>
                <div className="stat-pill total-pill">
                  🎯 {allPokemon.length - caughtCount} restantes
                </div>
              </div>
            </div>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Buscar pokémon por nombre o número..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
 
        <div className="main">
          {loading ? (
            <div className="loading-screen">
              <div className="loading-ball"><PokeBall size={64}/></div>
              <div className="loading-text">Cargando Pokédex...</div>
            </div>
          ) : (
            <>
              {(search.trim() || activeFilter) && (
                <div className="result-info">
                  {activeFilter === "caught" && !search.trim() && `${visibleList.length} pokémon atrapados 🎉`}
                  {activeFilter === "shiny" && !search.trim() && `${visibleList.length} shinies ✨`}
                  {search.trim() && `${visibleList.length} resultado${visibleList.length !== 1 ? "s" : ""} para "${search}"`}
                </div>
              )}
 
              {visibleList.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-emoji">😢</div>
                  <div className="no-results-text">No encontré ningún pokémon con ese nombre</div>
                </div>
              ) : (
                <div className="grid">
                  {visibleList.map(pokemon => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      caught={!!caught[pokemon.id]}
                      shiny={!!shiny[pokemon.id]}
                      onToggleCaught={toggleCaught}
                      onToggleShiny={toggleShiny}
                    />
                  ))}
                </div>
              )}
 
              {!search.trim() && !activeFilter && displayedPokemon.length < allPokemon.length && (
                <div ref={loaderRef} className="scroll-sentinel">
                  {loadingMore && <div className="loader">Cargando más pokémon... 🌸</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}