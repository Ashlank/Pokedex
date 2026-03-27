import { useState, useEffect, useCallback, useRef } from "react";
import pokemons from "./data/pokemon.json";
import PokeBall from "./components/PokeBall";
import PokemonCard from "./components/PokemonCard";
import SparkleIcon from "./components/SparkleIcon";
import "./App.css";

// IDs de pokémon legendarios y míticos (Pokédex Nacional, Gen 1-9)
// Fuente: Bulbapedia - Legendary & Mythical Pokémon
const LEGENDARY_IDS = new Set([
  // Gen 1
  144, 145, 146, // Articuno, Zapdos, Moltres
  150, 151,      // Mewtwo, Mew

  // Gen 2
  243, 244, 245, // Raikou, Entei, Suicune
  249, 250,      // Lugia, Ho-Oh
  251,           // Celebi

  // Gen 3
  377, 378, 379, // Regirock, Regice, Registeel
  380, 381,      // Latias, Latios
  382, 383, 384, // Kyogre, Groudon, Rayquaza
  385, 386,      // Jirachi, Deoxys

  // Gen 4
  480, 481, 482, // Uxie, Mesprit, Azelf
  483, 484,      // Dialga, Palkia
  485, 486,      // Heatran, Regigigas
  487,           // Giratina
  488, 489, 490, // Cresselia, Phione, Manaphy
  491, 492, 493, // Darkrai, Shaymin, Arceus

  // Gen 5
  494,           // Victini
  638, 639, 640, // Cobalion, Terrakion, Virizion
  641, 642,      // Tornadus, Thundurus
  643, 644,      // Reshiram, Zekrom
  645, 646,      // Landorus, Kyurem
  647, 648, 649, // Keldeo, Meloetta, Genesect

  // Gen 6
  716, 717, 718, // Xerneas, Yveltal, Zygarde
  719, 720, 721, // Diancie, Hoopa, Volcanion

  // Gen 7
  785, 786, 787, 788, // Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini
  789, 790, 791, 792, // Cosmog, Cosmoem, Solgaleo, Lunala
  793, 794, 795, 796, // Nihilego, Buzzwole, Pheromosa, Xurkitree
  797, 798, 799,      // Celesteela, Kartana, Guzzlord
  800,                // Necrozma
  801, 802,           // Magearna, Marshadow
  803, 804,           // Poipole, Naganadel
  805, 806,           // Stakataka, Blacephalon
  807,                // Zeraora
  808, 809,           // Meltan, Melmetal

  // Gen 8
  888, 889,           // Zacian, Zamazenta
  890,                // Eternatus
  891, 892,           // Kubfu, Urshifu
  893,                // Zarude
  894, 895,           // Regieleki, Regidrago
  896, 897,           // Glastrier, Spectrier
  898,                // Calyrex

  // Gen 9
  1001, 1002, 1003, 1004, // Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu
  1007, 1008,             // Koraidon, Miraidon
  1009, 1010,             // Walking Wake, Iron Leaves
  1014, 1015, 1016,       // Okidogi, Munkidori, Fezandipiti
  1017,                   // Ogerpon
  1020, 1021, 1022, 1023, // Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown
  1024,                   // Terapagos
  1025,                   // Pecharunt
]);

// Nombres oficiales en español de los pokémon que difieren del inglés.
// Fuente: https://bulbapedia.bulbagarden.net/wiki/List_of_Spanish_Pokémon_names
// Clave: ID de Pokédex Nacional (el mismo que en el JSON)

const SPANISH_NAMES = {
  // Gen 7
  772: "Código Cero",      // Type: Null

  // Gen 9 - Paradoja Pasado (Scarlet)
  984: "Colmilargo",       // Great Tusk
  985: "Colagrito",        // Scream Tail
  986: "Furioseta",        // Brute Bonnet
  987: "Melenaleteo",      // Flutter Mane
  988: "Reptalada",        // Slither Wing
  989: "Pelarena",         // Sandy Shocks
  1005: "Bramaluna",       // Roaring Moon

  // Gen 9 - Paradoja Futuro (Violet)
  990: "Ferrodada",        // Iron Treads
  991: "Ferrosaco",        // Iron Bundle
  992: "Ferropalmas",      // Iron Hands
  993: "Ferrocuello",      // Iron Jugulis
  994: "Ferropolilla",     // Iron Moth
  995: "Ferropúas",        // Iron Thorns
  1006: "Ferropaladín",    // Iron Valiant

  // DLC - The Indigo Disk
  1009: "Ondulagua",       // Walking Wake
  1010: "Ferroverdor",     // Iron Leaves
  1020: "Flamariete",      // Gouging Fire
  1021: "Electrofuria",    // Raging Bolt
  1022: "Ferromole",       // Iron Boulder
  1023: "Ferrotesta",      // Iron Crown
};

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