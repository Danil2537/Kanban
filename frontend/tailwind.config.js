module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
          body: ["var(--font-programme)", "sans-serif"],
          header: ["var(--font-suprapower)", "sans-serif"],
        },
      },
    },
  };