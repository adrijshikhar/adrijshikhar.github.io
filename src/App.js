import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';

import {
	About,
	Achievements,
	Education,
	Experience,
	Home,
	Interests,
	Projects,
	SideNavigationBar,
	Skills,
} from './components';

// Health check configuration
const HEALTH_CHECK_URL = 'https://n8n-2550.onrender.com/healthz';
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

const App = () => {
	// Health check loop - runs every 5-15 minutes
	useEffect(() => {
		const performHealthCheck = async () => {
			try {
				await fetch(HEALTH_CHECK_URL, {
					method: 'GET',
					mode: 'no-cors',
				});
				// With no-cors mode, we can't read response status, but the request will go through
				console.log('Health check request sent successfully');
			} catch (error) {
				console.log('Health check error:', error.message);
			}
		};

		const getRandomInterval = () =>
			// Random interval between min and max interval
			Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1)) +
			MIN_INTERVAL_MS;
		const scheduleNextHealthCheck = () => {
			const interval = getRandomInterval();
			console.log(
				`Next health check in ${Math.round(interval / 60000)} minutes`,
			);
			return setTimeout(() => {
				performHealthCheck().catch(error => {
					console.log('Unhandled health check error:', error);
				});
				scheduleNextHealthCheck();
			}, interval);
		};

		// Initial health check
		performHealthCheck().catch(error => {
			console.log('Initial health check error:', error);
		});

		// Schedule recurring health checks
		const timeoutId = scheduleNextHealthCheck();

		// Cleanup function
		return () => {
			clearTimeout(timeoutId);
		};
	}, []); // Empty dependency array means this runs once on mount

	return (
		<Fragment>
			<SideNavigationBar />
			<Home>
				<About />
				<hr className="m-0" />
				<Experience />
				<hr className="m-0" />
				<Skills />
				<hr className="m-0" />
				<Projects />
				<hr className="m-0" />
				<Achievements />
				<hr className="m-0" />
				<Education />
				<hr className="m-0" />
				<Interests />
			</Home>
		</Fragment>
	);
};

export default App;
