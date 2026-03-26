export default function PokeBall({ size = 20 }) {
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