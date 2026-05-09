/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			fontFamily: {
				geist: ['var(--font-geist)'],
				poppins: ['var(--font-poppins)'],
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#b55933',
					hover: '#9e4a2a',
					foreground: 'hsl(var(--primary-foreground))'
				},
				'bg-base': '#000000',
				'bg-surface': '#0a0a0a',
				'bg-elevated': '#111111',
				'border-muted': '#1f1f1f',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}