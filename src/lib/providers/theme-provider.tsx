'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Lazy initialization function that safely reads from localStorage
function getInitialTheme(): Theme {
	// During SSR, localStorage doesn't exist, so return default
	if (typeof window === 'undefined') {
		return 'dark';
	}
	const savedTheme = localStorage.getItem('theme') as Theme;
	if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
		return savedTheme;
	}
	return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Use lazy initialization to read from localStorage without setState in effect
	const [theme, setTheme] = useState<Theme>(getInitialTheme);
	const isInitialMount = useRef(true);

	// Mark that initial mount is complete after first render
	useEffect(() => {
		isInitialMount.current = false;
	}, []);

	// Apply theme to DOM and save to localStorage
	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		// Only save to localStorage after initial mount to avoid overwriting
		if (!isInitialMount.current) {
			localStorage.setItem('theme', theme);
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	};

	// Always provide the context, even during SSR
	// Use default "dark" theme during SSR, then update after mount
	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
