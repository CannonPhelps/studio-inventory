/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Background colors
				primary: 'var(--bg-primary)',
				secondary: 'var(--bg-secondary)',
				tertiary: 'var(--bg-tertiary)',
				card: 'var(--card-bg)',
				sidebar: 'var(--sidebar-bg)',
				input: 'var(--input-bg)',
				table: 'var(--table-bg)',
				'table-stripe': 'var(--table-stripe)',
				
				// Text colors
				'text-primary': 'var(--text-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-tertiary': 'var(--text-tertiary)',
				'text-input': 'var(--input-text)',
				
				// Border colors
				'border-primary': 'var(--border-primary)',
				'border-secondary': 'var(--border-secondary)',
				'border-sidebar': 'var(--sidebar-border)',
				'border-card': 'var(--card-border)',
				'border-input': 'var(--input-border)',
				'border-table': 'var(--table-border)',
				
				// Accent colors
				accent: 'var(--accent-primary)',
				'accent-secondary': 'var(--accent-secondary)',
				'accent-success': 'var(--accent-success)',
				'accent-warning': 'var(--accent-warning)',
				'accent-error': 'var(--accent-error)',
				'accent-info': 'var(--accent-info)',
				
				// Primary color scale
				'primary-50': 'var(--primary-50)',
				'primary-100': 'var(--primary-100)',
				'primary-200': 'var(--primary-200)',
				'primary-300': 'var(--primary-300)',
				'primary-400': 'var(--primary-400)',
				'primary-500': 'var(--primary-500)',
				'primary-600': 'var(--primary-600)',
				'primary-700': 'var(--primary-700)',
				'primary-800': 'var(--primary-800)',
				'primary-900': 'var(--primary-900)',
				'primary-950': 'var(--primary-950)',
				
				// Secondary color scale
				'secondary-50': 'var(--secondary-50)',
				'secondary-100': 'var(--secondary-100)',
				'secondary-200': 'var(--secondary-200)',
				'secondary-300': 'var(--secondary-300)',
				'secondary-400': 'var(--secondary-400)',
				'secondary-500': 'var(--secondary-500)',
				'secondary-600': 'var(--secondary-600)',
				'secondary-700': 'var(--secondary-700)',
				'secondary-800': 'var(--secondary-800)',
				'secondary-900': 'var(--secondary-900)',
				'secondary-950': 'var(--secondary-950)',
				
				// Tertiary color scale
				'tertiary-50': 'var(--tertiary-50)',
				'tertiary-100': 'var(--tertiary-100)',
				'tertiary-200': 'var(--tertiary-200)',
				'tertiary-300': 'var(--tertiary-300)',
				'tertiary-400': 'var(--tertiary-400)',
				'tertiary-500': 'var(--tertiary-500)',
				'tertiary-600': 'var(--tertiary-600)',
				'tertiary-700': 'var(--tertiary-700)',
				'tertiary-800': 'var(--tertiary-800)',
				'tertiary-900': 'var(--tertiary-900)',
				'tertiary-950': 'var(--tertiary-950)'
			},
			boxShadow: {
				'custom': 'var(--shadow)',
				'custom-sm': 'var(--shadow-sm)',
				'custom-md': 'var(--shadow-md)',
				'custom-lg': 'var(--shadow-lg)',
				'custom-xl': 'var(--shadow-xl)'
			}
		}
	},
	plugins: []
}; 