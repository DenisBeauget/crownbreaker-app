/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.tsx", "./app/**.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
 theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e3360b',
          dark: '#a02922',    
          light: '#ef5717',   
        },
        secondary: {
          DEFAULT: '#d57c6b', 
          dark: '#b85958',    
          light: '#b78c92',   
        },
        accent: {
          DEFAULT: '#752830',
        },
        neutral: {
          darkest: '#342a40', 
          dark: '#545c68',     
          light: '#f2eeeb',  
        }
      }
    }
  },
  plugins: [],
}