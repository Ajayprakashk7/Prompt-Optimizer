/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts}",
    "./services/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Remove safelist as it prevents proper purging - only keep essential classes
  safelist: [
    // Only keep the most critical classes that might be dynamically generated
    'bg-slate-900',
    'text-slate-300',
    'bg-indigo-600',
    'hover:bg-indigo-500',
    'animate-spin',
    'animate-[shimmer_1.5s_infinite]',
  ]
}
