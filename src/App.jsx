import { useState, useEffect, useCallback, useRef } from "react";
import pokemons from "./data/pokemon.json";
import PokeBall from "./components/PokeBall";
import PokemonCard from "./components/PokemonCard";
import SparkleIcon from "./components/SparkleIcon";
import "./App.css";
import { SPANISH_NAMES, LEGENDARY_IDS } from "./data/typeChart";

const getSpanishName = (id) => SPANISH_NAMES[id] ?? null;
const isLegendary = (id) => LEGENDARY_IDS.has(id);

const PAGE_SIZE = 40;

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback((updater) => {
    setVal(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        console.error("Error guardando en localStorage");
      }
      return next;
    });
  }, [key]);

  return [val, set];
}

export default function Pokedex() {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // null | "caught" | "shiny" | "remaining"
  const [loadingMore, setLoadingMore] = useState(false);
  const [caught, setCaught] = useLocalStorage("pokedex_caught", {});
  const [shiny, setShiny] = useLocalStorage("pokedex_shiny", {});
  const loaderRef = useRef(null);

  const baseList = activeFilter === "caught"    ? pokemons.filter(p => caught[p.id])
                 : activeFilter === "shiny"     ? pokemons.filter(p => shiny[p.id])
                 : activeFilter === "remaining" ? pokemons.filter(p => !caught[p.id])
                 : activeFilter === "legendary" ? pokemons.filter(p => isLegendary(p.id))
                 : null;

  const filtered = search.trim()
    ? (baseList ?? pokemons).filter(p => {
        const spanishName = getSpanishName(p.id);
        return (
          p.name.includes(search.toLowerCase()) ||
          String(p.id).includes(search.trim()) ||
          (spanishName && spanishName.toLowerCase().includes(search.toLowerCase()))
        );
      })
    : baseList;

  const visibleList = filtered ?? pokemons.slice(0, displayCount);

  const toggleFilter = (name) => {
    setActiveFilter(prev => prev === name ? null : name);
    setSearch("");
  };

  const isScrolling = !search.trim() && !activeFilter;
  useEffect(() => {
    if (!isScrolling || !loaderRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && displayCount < pokemons.length) {
        setLoadingMore(true);
        setTimeout(() => {
          setDisplayCount(prev => Math.min(prev + PAGE_SIZE, pokemons.length));
          setLoadingMore(false);
        }, 150);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [isScrolling, loadingMore, displayCount]);

  const toggleCaught = useCallback((id) => {
    setCaught(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setCaught]);

  const toggleShiny = useCallback((id) => {
    setShiny(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setShiny]);

  const caughtCount = Object.values(caught).filter(Boolean).length;
  const shinyCount = Object.values(shiny).filter(Boolean).length;
  const remainingCount = pokemons.length - caughtCount;

  return (
    <div className="app">
      <div className="header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <div className="logo">
                <img src="/favicon.png" alt="Pokédex" width="50" height="50" />
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
                <PokeBall size={14} /> {caughtCount} atrapados
              </button>
              <button
                className={`stat-pill shiny-pill ${activeFilter === "shiny" ? "active" : ""}`}
                onClick={() => toggleFilter("shiny")}
                title="Filtrar shinies"
              >
                <SparkleIcon /> {shinyCount} shinies
              </button>
              <button
                className={`stat-pill legendary-pill ${activeFilter === "legendary" ? "active" : ""}`}
                onClick={() => toggleFilter("legendary")}
                title="Filtrar legendarios"
                >
                ⭐ Legendarios
              </button>
              <button
                className={`stat-pill total-pill ${activeFilter === "remaining" ? "active" : ""}`}
                onClick={() => toggleFilter("remaining")}
                title="Filtrar restantes"
              >
                🎯 {remainingCount} restantes
              </button>
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
        {(search.trim() || activeFilter) && (
          <div className="result-info">
            {activeFilter === "caught"    && !search.trim() && `${visibleList.length} pokémon atrapados 🎉`}
            {activeFilter === "shiny"     && !search.trim() && `${visibleList.length} shinies ✨`}
            {activeFilter === "remaining" && !search.trim() && `${visibleList.length} pokémon restantes 🎯`}
            {activeFilter === "legendary" && !search.trim() && `${visibleList.length} legendarios ⭐`}
            {search.trim() && `${visibleList.length} resultado${visibleList.length !== 1 ? "s" : ""} para "${search}"`}
          </div>
        )}

        {visibleList.length === 0 ? (
          <div className="no-results">
            <div className="no-results-emoji">
              {activeFilter === "remaining" ? "🏆" : "😢"}
            </div>
            <div className="no-results-text">
              {activeFilter === "remaining"
                ? "¡Los atrapaste a todos!"
                : "No encontré ningún pokémon con ese nombre"}
            </div>
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

        {isScrolling && displayCount < pokemons.length && (
          <div ref={loaderRef} className="scroll-sentinel">
            {loadingMore && <div className="loader">Cargando más pokémon... 🌸</div>}
          </div>
        )}
      </div>
    </div>
  );
}