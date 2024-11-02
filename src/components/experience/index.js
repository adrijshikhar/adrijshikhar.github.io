import { h } from 'preact';

import ExpCard from './ExpCard';

const Experience = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column"
		id="experience"
	>
		<div className="my-auto">
			<h2 className="mb-5">Experience</h2>

			<ExpCard
				position="SDE lll"
				companyName="Hevo Data"
				companyLink="https://hevodata.com/"
				location="Bangalore"
				date="Jun 2022 - Current"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>
						Load data from any source into your warehouse
					</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<p>
							<p className="fw-bold mb-1">CDC Framework Project:</p>
							<ul>
								<li>
									Ownership and Execution: Led the complete implementation of
									real-time CDC framework using Debezium Engine (open source)
									which significantly enhanced data synchronization and ensured
									seamless real-time updates.
								</li>
								<li>
									Performance Boost: Achieved a 5x increase in data ingestion
									speed within the MySQL connector, optimizing system
									efficiency.
								</li>
								<li>
									Database Interaction Optimization: Engineered improvements in
									core database interactions, by implementing a metadata system
									that allowed us to scale our ETL platform by 15x.
								</li>
								<li>
									Schema Catalog Service:
									<ul>
										<li>
											Designed and built a generic schema service from scratch
											to manage and validate data schemas in ETL pipelines, with
											seamless integration and testing using Debezium
											connectors.
										</li>
										<li>
											Supported source-specific features, including handling
											unchanged toast datum from PostgreSQL and diverse data
											types from various data sources, ensuring flexibility
											across different ETL environments.
										</li>
										<li>
											Implemented schema versioning, metadata management, and
											compatibility checks to maintain data quality, streamline
											data processing, and accommodate schema evolution.
										</li>
									</ul>
								</li>
							</ul>
						</p>
						<p>
							<p className="fw-bold mb-1">
								System Optimization and Security Enhancements:
							</p>

							<ul>
								<li>
									Source Object Generation Flow: Optimized the source object
									generation process, resulting in a 10x improvement in pipeline
									performance, enabling support for larger datasets.
								</li>
								<li>
									REST API Security Enhancements: Enhanced the REST API
									connector by implementing OAuth 2.0 authorization, improving
									security and user management.
								</li>
							</ul>
						</p>
						<p>
							<p className="fw-bold mb-1">
								SurveyMonkey Connector Development:
							</p>
							<ul>
								<li>
									Spearheaded the development and launch of the SurveyMonkey
									connector, contributing to the expansion of Hevo&apos;s
									connector ecosystem.
								</li>
							</ul>
						</p>
						<p>
							<p className="fw-bold mb-1">
								Critical Customer Issue Resolution:
							</p>
							<ul>
								<li>
									Managed and resolved several complex customer issues for key
									clients, significantly improving customer satisfaction.
								</li>
							</ul>
						</p>
						<p>
							<p className="fw-bold mb-1">Innovative System Enhancements:</p>
							<ul>
								<li>
									Real-time Logs Implementation: Implemented data governance
									tool to handle PII redaction in near real-time using AWS S3
									and AWS Comprehend, ensuring data privacy and enhancing user
									experience.
								</li>
								<li>
									Microservices and Task Execution: Worked on integrating a
									microservices architecture on AWS Fargate and implemented a
									Temporal-based task execution system, improving reliability
									and streamlining hierarchical DAG processes.
								</li>
							</ul>
						</p>
						<p>
							<p className="fw-bold mb-1">
								Documentation and Knowledge Sharing:
							</p>
							<ul>
								<li>
									Regularly contributed to improving documentation quality and
									conducted knowledge transfer sessions, fostering team
									collaboration.
								</li>
							</ul>
						</p>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Software Development Intern"
				companyName="Hevo Data"
				companyLink="https://hevodata.com/"
				location="Bangalore"
				date="Sep 2021 - Oct 2021"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>
						Load data from any source into your warehouse
					</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Added support for &apos; wal2json&apos; output plugin for
								postgres replication.
							</li>
							<li>
								Reduced WAL processing time taken by the platform, by 60%.
							</li>
							<li>
								Implemented dynamic plugin selection using Guice dependency
								injection.
							</li>
							<li>
								Implemented OAuth 2.0 feature for accessing protected Rest APIs
							</li>
							<li>Tech Stack: Java, Postgres</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Software Development Intern"
				companyName="MTX Global"
				companyLink="https://www.mtxb2b.com/s/"
				location="Hydrabad"
				date="Jun 2021 - Aug 2021"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>GO DIGITAL. THINK HUMAN.</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Worked on curating ETL data pipeline from concept to proof of
								concept.
							</li>
							<li>
								Implemented on-demand data transformations using Apache Spark,
								and streaming the same using Apache Kafka onto Google Cloud
								Platform.
							</li>
							<li>
								Containerized individual components of the pipeline for better
								development and deployment.
							</li>
							<li>
								Solely configured and maintained pipeline on Google K8s Engine.
							</li>
							<li>
								Orchestrated data visualization service to configure overlayed
								charts.
							</li>
							<li>
								Tech Stack: Python, Apache Spark, Docker, Kubernetes, Google
								Cloud Platform
							</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Software Development Intern"
				companyName="Triomics"
				companyLink="https://triomics.in/"
				location="Gurgaon"
				date="Apr 2021 - May 2021"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>
						Making Clinical Trials faster and transparent
					</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Collaborated with the core founding team on the initial stages
								of the platform.
							</li>
							<li>
								Setup infrastructure for the applications, keeping scalability
								and security into account.
							</li>
							<li>
								Developed management dashboard service for micro and macro level
								user access across the apps.
							</li>
							<li>
								Customized D3 for visualization of data, fitting our use case.
							</li>
							<li>Tech Stack: React, Django, Postgres</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Software Development Intern"
				companyName="Rephrase.ai"
				companyLink="https://www.rephrase.ai/"
				location="Bangalore"
				date="Oct 2020 - Mar 2021"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>
						Use Generative AI to address millions of customers personally,
						through videos.
					</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Ensured stability of the product by integrating tests and error
								handling.
							</li>
							<li>
								Optimized uploading and validating data from user&apos;s end.
							</li>
							<li>
								Implemented Stripe, Sentry, Clickup for better development
								cycle.
							</li>
							<li>
								Integrated continuous integration and ensured continuous
								delivery among various services.
							</li>
							<li>Worked on graphene to optimize API performance.</li>
							<li>Tech Stack: React, Django, GraphQL, ffmpeg</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Software Engineering Intern"
				companyName="Powerplay"
				companyLink="https://www.getpowerplay.in/"
				location="Bangalore"
				date="Apr 2020 - Jun 2020"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>
						Helping construction contractors track realtime on-site progress
					</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Implemented core features and structure from concept through
								deployment.
							</li>
							<li>
								Introduced REST API&apos;s, server-side pagination and JWT based
								authentication system.
							</li>
							<li>
								Standardized UI libraries by enclosing them in highly
								customizable wrapper for code reusability.
							</li>
							<li>Assessed UX and UI designs for technical feasibility.</li>
							<li>Developed standard and ad hoc report in table format.</li>
							<li>
								Collaborated with product team members to implement new feature
								developments.
							</li>
							<li>Tech Stack: React, NodeJS, MongoDB</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Developer"
				companyName="SDSLabs"
				companyLink="https://sdslabs.co/"
				location="IIT Roorkee"
				date="Jan 2019 - Jul 2020"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>Think. Build. Ship</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Under the hood of the group, we promote technical culture on the
								campus by conducting hackathons, lecture series, and
								competitions.
							</li>
							<li>
								Responsible for maintaining current applications and server
								management.
							</li>
							<li>
								Mentored freshmen students in their projects for the Winter of
								Code program.
							</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Manager"
				companyName="Entrepreneurship Cell"
				companyLink="https://www.ecelliitr.org/"
				location="IIT Roorkee"
				date="Feb 2019 - Feb 2020"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>#inspiringinnovation</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Conducted meetings, hands-on workshops and events on various
								topics related to entrepreneurship and startups.
							</li>
							<li>Participated in various case studies regarding SaaS.</li>
							<li>
								Developed core pipeline and worked on optimizing user
								experience.
							</li>
							<li>
								Spearheaded the development of user interface and the flow of
								login & registration forms.
							</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>

			<ExpCard
				position="Web Developer"
				companyName="Cognizance"
				companyLink="https://cognizance.org.in/"
				location="IIT Roorkee"
				date="Dec 2018 - Jan 2020"
			>
				<ExpCard.Content>
					<ExpCard.Paragraph>IIT Roorkee Tech Fest</ExpCard.Paragraph>
					<ExpCard.Paragraph>
						<ul>
							<li>
								Been a part of a 3-tier team of 5+ executive members, associate
								members, and co-coordinators to establish web presence of
								Cognizance 2019 and 2020.
							</li>
							<li>Contributed as a Manager Web in 2019 and 2020</li>
							<li>
								Worked on designing the architecture and implementing core
								features of the progressive web app.
							</li>
							<li>
								Ported the legacy code from webpack v2 to webpack v4 and
								restructured the node dependencies.
							</li>
						</ul>
					</ExpCard.Paragraph>
				</ExpCard.Content>
			</ExpCard>
		</div>
	</section>
);

export default Experience;
