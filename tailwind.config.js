/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			fontFamily: {
				geist: ['var(--font-geist)'],
				poppins: ['var(--font-poppins)'],
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: '#b55933',
					hover: '#9e4a2a',
					foreground: 'hsl(var(--primary-foreground))'
				},
				'bg-base': 'var(--background)',
				'bg-surface': 'var(--background)',
				'bg-elevated': 'var(--background)',
				'border-muted': 'rgba(var(--foreground-rgb), 0.2)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}