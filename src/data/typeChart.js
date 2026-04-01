// Tabla completa de efectividad de tipos (Gen 6+)
// chart[atacante][defensor] = multiplicador
// Solo incluimos los que NO son x1 para mantenerlo compacto.

const CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const ALL_TYPES = Object.keys(CHART);

/**
 * Dado un array de tipos defensivos (ej: ["water", "flying"]),
 * devuelve un objeto con la efectividad de cada tipo atacante.
 * { fire: 0.5, electric: 2, rock: 2, ... }
 */
export function getTypeEffectiveness(defenderTypes) {
  const result = {};
  for (const attacker of ALL_TYPES) {
    let multiplier = 1;
    for (const defender of defenderTypes) {
      const attackerRow = CHART[attacker] ?? {};
      multiplier *= attackerRow[defender] ?? 1;
    }
    if (multiplier !== 1) result[attacker] = multiplier;
  }
  return result;
}

/**
 * Devuelve los tipos que le hacen x2 o x4 al pokemon defensor.
 * Resultado ordenado de mayor a menor efectividad.
 * [{ type: "electric", multiplier: 4 }, { type: "rock", multiplier: 2 }, ...]
 */
export function getWeaknesses(defenderTypes) {
  const effectiveness = getTypeEffectiveness(defenderTypes);
  return Object.entries(effectiveness)
    .filter(([, mult]) => mult > 1)
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => b.multiplier - a.multiplier);
}

/**
 * Devuelve los tipos a los que el pokemon es resistente (x0.5, x0.25) o inmune (x0).
 */
export function getResistances(defenderTypes) {
  const effectiveness = getTypeEffectiveness(defenderTypes);
  return Object.entries(effectiveness)
    .filter(([, mult]) => mult < 1)
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => a.multiplier - b.multiplier);
}

// Colores por tipo (para badges y UI)
export const TYPE_COLORS = {
  normal:   "#A8A878", fire:     "#F08030", water:    "#6890F0",
  electric: "#F8D030", grass:    "#78C850", ice:      "#98D8D8",
  fighting: "#C03028", poison:   "#A040A0", ground:   "#E0C068",
  flying:   "#A890F0", psychic:  "#F85888", bug:      "#A8B820",
  rock:     "#B8A038", ghost:    "#705898", dragon:   "#7038F8",
  dark:     "#705848", steel:    "#B8B8D0", fairy:    "#EE99AC",
};

// Emoji por tipo
export const TYPE_EMOJI = {
  normal: "🔘", fire: "🔥", water: "💧", electric: "⚡", grass: "🌿",
  ice: "❄️", fighting: "🥊", poison: "☠️", ground: "🌍", flying: "🪽",
  psychic: "🔮", bug: "🐛", rock: "🪨", ghost: "👻", dragon: "🐉",
  dark: "🌑", steel: "⚙️", fairy: "🦋",
};

// IDs de pokémon legendarios y míticos (Pokédex Nacional, Gen 1-9)
// Fuente: Bulbapedia - Legendary & Mythical Pokémon
export const LEGENDARY_IDS = new Set([
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
export const SPANISH_NAMES = {
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