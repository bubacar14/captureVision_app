export const COLORS = {
  // Couleurs principales
  darkPrimary: 'var(--color-dark-primary)',    // #101D25 - Fond sombre principal
  darkSecondary: 'var(--color-dark-secondary)', // #232D36 - Fond sombre secondaire
  accent: 'var(--color-accent)',               // #3B82F6 - Couleur d'accent bleue
  text: 'var(--color-text)',                   // #9FA2A7 - Texte gris

  // États des éléments
  hover: {
    accent: '#60A5FA',  // Blue-400 pour le hover
    darkPrimary: '#1A2730'  // Version plus claire du fond pour le hover
  },

  // États des boutons
  button: {
    primary: 'var(--color-accent)',
    secondary: 'var(--color-dark-secondary)',
    disabled: '#4A5258'
  },

  // États des inputs
  input: {
    background: 'var(--color-dark-secondary)',
    border: 'var(--color-text)',
    focus: 'var(--color-accent)'
  }
}
