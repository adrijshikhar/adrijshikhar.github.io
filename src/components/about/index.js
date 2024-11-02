import { h } from 'preact';

const About = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column justify-content-center"
		id="about"
	>
		<h1 className="mb-4 d-flex flex-wrap">
			<span className="text-primary">Adrij Shikhar</span>
		</h1>
		<p className="lead mb-3">
			Welcome to my portfolio! I&apos;m a 26-year-old graduate from IIT Roorkee.
			While my academic journey began in the world of chemistry, I quickly
			discovered my true passion for software development during my freshman
			year.
		</p>
		<p className="lead mb-3">
			Over the past year, I&apos;ve been honing my skills and working on
			exciting projects. My time is now dedicated to reading, writing, and
			crafting software solutions that not only solve problems but also push the
			boundaries of innovation.
		</p>
		<p className="lead mb-3">
			Explore my portfolio to see the fruits of my labor, from web applications
			to mobile apps and everything in between. I&apos;m excited to share my
			journey and the projects that have shaped my development career. If you
			have any questions or would like to collaborate, don&apos;t hesitate to
			get in touch!
		</p>
		<p className="lead mb-3">
			Let&apos;s embark on this coding adventure together!
		</p>
		<p className="lead mb-5">
			<i className="fa fa-mobile mobile-icon me-2"></i>
			+91 (821) 805 8928
		</p>
		<div className="social-icons">
			<a
				className="icon"
				href="https://www.linkedin.com/in/adrij-shikhar"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fab fa-linkedin-in"></i>
			</a>
			<a
				className="icon"
				href="https://github.com/adrijshikhar/"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fab fa-github"></i>
			</a>
			<a
				className="icon"
				href="mailto:ashikhar@ee.iitr.ac.in"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fa fa-envelope"></i>
			</a>
			<a
				className="icon"
				href="https://dev.to/adrijshikhar"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fab fa-dev" title="adrijshikhar's DEV Profile"></i>
			</a>
			<a
				className="icon"
				href="https://www.reddit.com/user/nemesis0009"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fab fa-reddit"></i>
			</a>
			<a
				className="icon"
				href="https://www.facebook.com/adrij.shikhar"
				target="_blank"
				rel="noreferrer noopener"
			>
				<i className="fab fa-facebook-f"></i>
			</a>
			<a
				className="icon"
				data-toggle="tooltip"
				data-placement="bottom"
				title="Download Resume"
				href="/assets/resume.pdf"
				download="Adrij Shikhar Resume.pdf"
			>
				<i className="fas fa-download"></i>
			</a>
		</div>
	</section>
);

export default About;
