/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter-Regular'], // testi generali
        'inter-medium': ['Inter-Medium'], // testi normali
        'inter-semibold': ['Inter-SemiBold'], // sottotitoli e testi importanti
        'inter-bold': ['Inter-Bold'], // titolo principale
      },
      colors: {
        // Colori primari - Blu medico/sanitario
        primary: {
          50: '#eff6ff',   // Blu molto chiaro (backgrounds)
          100: '#dbeafe',  // Blu chiaro (hover states)
          200: '#bfdbfe',  // Blu soft
          300: '#93c5fd',  // Blu medio-chiaro
          400: '#60a5fa',  // Blu medio
          500: '#3b82f6',  // Blu principale (PRIMARY)
          600: '#2563eb',  // Blu scuro (buttons hover)
          700: '#1d4ed8',  // Blu molto scuro
          800: '#1e40af',  // Blu dark mode
          900: '#1e3a8a',  // Blu più scuro
        },
        
        // Grigi neutri - Per testi e backgrounds
        neutral: {
          50: '#fafafa',   // Bianco sporco
          100: '#f5f5f5',  // Grigio chiarissimo
          200: '#e5e5e5',  // Grigio chiaro
          300: '#d4d4d4',  // Grigio medio-chiaro
          400: '#a3a3a3',  // Grigio medio
          500: '#737373',  // Grigio principale
          600: '#525252',  // Grigio scuro
          700: '#404040',  // Grigio molto scuro
          800: '#262626',  // Grigio dark mode
          900: '#171717',  // Nero quasi
        },
        
        // Colori di stato/feedback
        success: '#10b981',    // Verde successo
        warning: '#f59e0b',    // Arancione avviso
        error: '#ef4444',      // Rosso errore
        info: '#3b82f6',       // Blu informativo
      },
    },
  },
  plugins: [],
}