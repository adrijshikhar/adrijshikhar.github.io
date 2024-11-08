import { h } from 'preact';

import ProjectCard from './ProjectCard';

const Projects = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column"
		id="projects"
	>
		<div className="my-auto">
			<h2 className="mb-5">Projects</h2>
			<ProjectCard
				title="ScraperQL"
				company="Dgraph Labs"
				date="Oct 2020"
				link="https://github.com/adrijshikhar/scraper-ql"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						Dgraph Labs hosted the &apos;Hack and Slash GraphQL&apos; hackathon
						to showcase the power of Slash GraphQL.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Developed a web scraper using GraphQL to leverage the nesting
								power of it.
							</li>
							<li>
								You have a single query resolver called scrape that takes in a
								URL as a parameter and returns a generic defined entity such as
								an HtmlNode
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Kill-Zee"
				company="Global Game Jam 2020"
				date="Jan 2020"
				link="https://github.com/adrijshikhar/kill-zee"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						A small tactical game in Lua to kill zombies and protect your tower
						before its too late.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						Spearheaded and implemented the underlying core features and worked
						on performance optimization.
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Issue Labeler Bot"
				company="SDSLabs"
				date="Jul 2020 - Oct 2020"
				link="https://github.com/sdslabs/SDSLabs-Issue-Labeler"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						It is a github bot which uses machine learning to automate the
						labelling of issues on Github by critical analysis of its contentC
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Generated training dataset by scraping around 20,000 issues on
								Github.
							</li>
							<li>
								Fine-Tuned the Google Bert Model on the dataset. Exported the
								trained model to integrate it with the Github bot.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Coderunner 2.0"
				company="SDSLabs"
				date="Oct 2019 - Mar 2020"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						Program code compiler is written in Golang.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>Implemented core functionality CLI and exposed as API.</li>
							<li>
								Designed central agent to govern micro services, optimise cost &
								increase reliability
							</li>
							<li>
								Added GRPC server to spawn runners in docker environment with
								custom log factory.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>
			<ProjectCard
				title="Accounts"
				company="SDSLabs"
				date="Jul 2020 - Oct 2020"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						It is an indigenous multi-provider authentication framework based on
						OAuth-2. It comprises of two standalone authentication and resource
						server.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Worked on improving the OAuth flow and containerising the
								applications for better stability and scaling.
							</li>
							<li>
								Setup containerised infrastructure for developement as well as
								production environment.
							</li>
							<li>
								Worked on additional features such as server-side redis caching.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard title="Cerebro" company="SDSLabs" date="Apr 2019 - Dec 2019">
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						Cerebro, a platform for hosting data hackathons exclusively in IITR
						developed by SDSLabs. It&apos;s challenges and competitions are
						maintained by members of SDSLabs and Data Science Group.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Implemented Admin Panel to host and manage machine learning
								competitions with submissions and managing posts.
							</li>
							<li>
								Worked on additional features such as edit post and lazy loading
								of news feed.
							</li>
							<li>
								Built on Open source PHP framework, Laravel with frontend SPA
								client in ReactJS and Redux.
							</li>
						</ul>
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						For more details, check out the{' '}
						<a href="https://blog.sdslabs.co/2018/12/cerebro">blog post</a> on
						Cerebro.
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Slackbot"
				company="SDSLabs"
				date="July 2021 - Dec 2021"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						A simple yet extensive bot written in Golang, which uses Sockets to
						communicate to Slack API.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Developed core features with plugin layer for attaching
								different bots onto one single point.
							</li>
							<li>Integrated with Google APIs for real-time chat features.</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Create React App Webpack"
				company="SDSLabs"
				date="July 2020 - Aug 2020"
				link="https://github.com/adrijshikhar/create-react-app-webpack"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						An initial set up for react and webpack using a single command
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						It is light and minilistic with bare minimum configuration needed to
						spawn a react app.
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Vega VS Code Extension"
				company="Major League Hacking"
				date="Jun 2020 - Jun 2020"
				link="https://github.com/adrijshikhar/vega-vscode-extension"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						MLH and Microsoft joined forces to host a hackathon for building new
						and improving existing coding tools.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Integrated Vega charting library to VSCode, to generate charts
								and diagrams on the go.
							</li>
							<li>
								It reads the config from the JSON schema and shows the output in
								the Web View of VSCode
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="DarkDev"
				company="SDSLabs"
				date="Apr 2020 - Present"
				link="https://github.com/adrijshikhar/darkdev"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						A self crafted VS Code Theme, for those who like it in dark mode.
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="E-Summit PWA"
				company="IIT Roorkee"
				date="Jan 2019 - Jan 2020"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						E-Summit is an event held to exhibit the entrepreneurial talent and
						creativity through many competitions like business ventures, product
						design competition, etc.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Developed core pipeline and worked on optimizing user
								experience.
							</li>
							<li>
								Spearheaded the development of user interface and the flow of
								login & registration forms
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Cognizance"
				company="IIT Roorkee"
				date="Jan 2019 - Feb 2020"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						Cognizance is the Tech Fest organized by IIT Roorkee. It is a
						prgressive web app with conceptualized the ER Diagram and
						implemented the relational database in PSQL.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Worked on designing the architecture and implementing core
								features of the progressive web app
							</li>
							<li>
								Ported the legacy code from webpack v2 to webpack v4 and
								restructured the dependencies.
							</li>
							<li>
								Worked alongside design team for faster and better development
								cycle for user interface.
							</li>
							<li>
								Built on Django with frontend SPA client in ReactJS and Redux.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard
				title="Covid 19 Tracker"
				company="SDSLabs"
				date="Apr 2020 - May 2020"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						A cross platform application to track Covid-19 activities, based on
						Flutter framework.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Integrated maps sdk to pinpoint data for convenient visual
								understanding across India.
							</li>
							<li>
								Lead the effort to introduce Government Protocols to be followed
								to prevent spreading of the same.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>
			<ProjectCard
				title="Hidden Stone"
				company="Utthan Foundation Trust"
				date="Dec 2018 - May 2019"
			>
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						The trust is working to train the village as well as urban
						downtrodden people of the society.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>Lead a team of four, from design to development cycle.</li>
							<li>Established using ReactJS and Redux for state management.</li>
							<li>
								Worked on wrappers to extend the functionalities of libraries
								used, such as material ui.
							</li>
							<li>
								Integrated Google Sheets API for newsletter and donation
								information.
							</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>

			<ProjectCard title="evem" company="SDSWoC 19" date="Dec 2018 - Jan 2019">
				<ProjectCard.Content>
					<ProjectCard.Paragraph>
						A website that provides information regarding the bookings of the
						venues of IIT Roorkee. and gives you a centralized system to book
						the venue for certain events.
					</ProjectCard.Paragraph>
					<ProjectCard.Paragraph>
						<ul>
							<li>
								Implemented personalized calender, feedback portal and search
								feature.
							</li>
							<li>Pure HTML/CSS, JS usage with PHP as backend.</li>
						</ul>
					</ProjectCard.Paragraph>
				</ProjectCard.Content>
			</ProjectCard>
		</div>
	</section>
);

export default Projects;
