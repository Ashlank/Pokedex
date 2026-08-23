// Traducciones oficiales de biomas de Minecraft al español
// Fuente: nombres oficiales del juego (es_es)
// Los biomas custom de Cobblemon/mods no tienen traducción oficial → se dejan en inglés

export const BIOME_TRANSLATIONS = {
  // Overworld - oficial Minecraft
  "Badlands":           "Tierras baldías",
  "Bamboo":             "Jungla de bambú",
  "Beach":              "Playa",
  "Cherry Blossom":     "Bosque de cerezos",
  "Cold":               "Frío",
  "Cold Ocean":         "Océano frío",
  "Deep Dark":          "Oscuridad profunda",
  "Deep Ocean":         "Océano profundo",
  "Desert":             "Desierto",
  "Dripstone":          "Cuevas de estalactitas",
  "End":                "El Fin",
  "Forest":             "Bosque",
  "Freezing":           "Glacial",
  "Freshwater":         "Agua dulce",
  "Frozen Ocean":       "Océano helado",
  "Frozen River":       "Río helado",
  "Glacial":            "Glacial",
  "Grassland":          "Llanura",
  "Highlands":          "Tierras altas",
  "Hills":              "Colinas",
  "Island":             "Isla",
  "Jungle":             "Jungla",
  "Lukewarm Ocean":     "Océano templado",
  "Lush":               "Cuevas exuberantes",
  "Magical":            "Mágico",
  "Mountain":           "Montaña",
  "Muddy":              "Manglar",
  "Mushroom":           "Campos de hongos",
  "Mushroom Fields":    "Campos de hongos",
  "Nether":             "El Inframundo",
  "Nether Basalt":      "Inframundo: Deltas de basalto",
  "Nether Crimson":     "Inframundo: Bosque carmesí",
  "Nether Desert":      "Inframundo: Desierto de almas",
  "Nether Forest":      "Inframundo: Bosque",
  "Nether Frozen":      "Inframundo: Helado",
  "Nether Fungus":      "Inframundo: Bosque de hongos",
  "Nether Mountain":    "Inframundo: Montañas",
  "Nether Overgrowth":  "Inframundo: Vegetación",
  "Nether Quartz":      "Inframundo: Desierto de cuarzo",
  "Nether Soul Fire":   "Inframundo: Valle de arena de almas",
  "Nether Soul Sand":   "Inframundo: Valle de arena de almas",
  "Nether Toxic":       "Inframundo: Tóxico",
  "Nether Warped":      "Inframundo: Bosque distorsionado",
  "Nether Wasteland":   "Inframundo: Páramo",
  "Ocean":              "Océano",
  "Overworld":          "Mundo principal",
  "Peak":               "Cima",
  "Plains":             "Llanura",
  "Plateau":            "Meseta",
  "River":              "Río",
  "Sandy":              "Arenoso",
  "Savanna":            "Sabana",
  "Shrubland":          "Matorral",
  "Sky":                "Cielo",
  "Snowy":              "Nevado",
  "Snowy Beach":        "Playa nevada",
  "Snowy Forest":       "Bosque nevado",
  "Snowy Taiga":        "Taiga nevada",
  "Spooky":             "Bosque oscuro",
  "Sunflower Plains":   "Llanura de girasoles",
  "Swamp":              "Pantano",
  "Taiga":              "Taiga",
  "Temperate":          "Templado",
  "Temperate Ocean":    "Océano templado",
  "Thermal":            "Termal",
  "Tropical Island":    "Isla tropical",
  "Tundra":             "Tundra",
  "Volcanic":           "Volcánico",
  "Warm Ocean":         "Océano cálido",

  // Biomas de mods — sin traducción oficial, se muestran en inglés
  "Aether":             "Aether",
  "Arid":               "Árido",
  "Bumblezone":         "Bumblezone",
  "Coast":              "Costa",
  "Crystal Canyon":     "Crystal Canyon",
  "Crystalline Chasm":  "Crystalline Chasm",
  "Floral":             "Floral",
  "Floral Meadow":      "Floral Meadow",
  "Howling Constructs": "Howling Constructs",
  "Pollinated Fields":  "Pollinated Fields",
  "Skyroot Forest":     "Skyroot Forest",
  "Skyroot Grove":      "Skyroot Grove",
  "Skyroot Meadow":     "Skyroot Meadow",
  "Skyroot Woodland":   "Skyroot Woodland",
  "Warped Desert":      "Warped Desert",
};

export function translateBiomes(biomesStr) {
  if (!biomesStr || biomesStr.trim() === '') return '';
  return biomesStr
    .split(',')
    .map(b => {
      const trimmed = b.trim();
      return BIOME_TRANSLATIONS[trimmed] ?? trimmed;
    })
    .join(', ');
}
