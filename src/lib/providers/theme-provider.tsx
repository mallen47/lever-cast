'use client';

import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	// Always initialize with 'dark' to match server render
	// The blocking script sets the DOM class, and suppressHydrationWarning on <html>
	// allows the initial mismatch. We'll sync state from DOM after mount.
	const [theme, setTheme] = useState<Theme>('dark');
	const isInitialMount = useRef(true);

	// Sync state from DOM class (set by blocking script) after mount
	// This ensures state matches what's actually rendered
	useLayoutEffect(() => {
		const root = document.documentElement;
		const domTheme: Theme = root.classList.contains('dark')
			? 'dark'
			: 'light';
		if (domTheme !== theme) {
			setTheme(domTheme);
		}
		isInitialMount.current = false;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Apply theme to DOM and save to localStorage
	useEffect(() => {
		const root = document.documentElement;
		// Sync DOM with state
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		// Only save to localStorage after initial mount to avoid overwriting
		// The script already set it, so we only update on user changes
		if (!isInitialMount.current) {
			try {
				localStorage.setItem('theme', theme);
			} catch {
				// localStorage might not be available
			}
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
