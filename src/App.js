import { h } from 'preact';

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

const App = () => (
	<div id="page-top">
		<SideNavigationBar />
		<Home>
			<About />
			<hr className="m-0" />
			<Education />
			<hr className="m-0" />
			<Skills />
			<hr className="m-0" />
			<Experience />
			<hr className="m-0" />
			<Projects />
			<hr className="m-0" />
			<Achievements />
			<hr className="m-0" />
			<Interests />
		</Home>
	</div>
);

export default App;
