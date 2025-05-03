/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  theme: {
    extend: {
      keyframes: {
        "plane-flight": {
          "0%": { transform: "translateX(-100%) rotate(-45deg)" },
          "50%": {
            transform: "translateX(0%) translateY(-15px) rotate(-45deg)",
          },
          "100%": { transform: "translateX(100%) rotate(-45deg)" },
        },
      },
      animation: {
        "plane-flight": "plane-flight 3s infinite ease-in-out",
      },
    },
  },
};
