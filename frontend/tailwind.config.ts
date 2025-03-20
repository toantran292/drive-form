/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require("tailwindcss-animate") // Đảm bảo plugin này được import
    ],
  };
  