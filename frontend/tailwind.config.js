import brandPreset from './tailwind.preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  presets: [brandPreset],
  theme: { extend: {} },
  plugins: [],
};
