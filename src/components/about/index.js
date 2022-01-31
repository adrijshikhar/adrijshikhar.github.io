import { h } from 'preact';

const About = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column justify-content-center"
		id="about"
	>
		<h1 className="mb-4 d-flex flex-wrap">
			<span className="mr-1">Adrij</span>
			<span className="text-primary">Shikhar</span>
		</h1>
		<p className="lead mb-5">
			I am a 23-year-old final year student enrolled in Chemical Engineering at
			IIT Roorkee. I developed a passion for development in my freshmen year and
			since then most of my time goes into reading and writing software.
		</p>
		<div className="social-icons">
			<a
				className="icon"
				href="https://www.linkedin.com/in/adrij-shikhar-460a89111/"
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
			<button
				type="button"
				className="icon fa fa-mobile"
				data-toggle="tooltip"
				data-placement="bottom"
				title="+91 (821) 805-8928"
			></button>
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
