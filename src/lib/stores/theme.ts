import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Get initial theme from localStorage or default to system preference
const getInitialTheme = () => {
	if (browser) {
		const saved = localStorage.getItem('theme');
		if (saved && (saved === 'light' || saved === 'dark')) return saved as 'light' | 'dark';
		
		// Check system preference
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
	}
	return 'light';
};

// Create the store
export const theme = writable<'light' | 'dark'>(getInitialTheme());

// Subscribe to theme changes and update DOM
if (browser) {
	theme.subscribe((value) => {
		// Update localStorage
		localStorage.setItem('theme', value);
		
		// Update data-theme attribute
		document.documentElement.setAttribute('data-theme', value);
		
		// Update body class for Tailwind dark mode
		if (value === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			document.documentElement.classList.add('dark');
		}
	});
}

// Toggle theme function
export function toggleTheme() {
	theme.update(current => current === 'light' ? 'dark' : 'light');
}

// Set theme function
export function setTheme(newTheme: 'light' | 'dark') {
	theme.set(newTheme);
} 