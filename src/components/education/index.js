import { h } from 'preact';

const Education = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column"
		id="education"
	>
		<div className="my-auto">
			<h2 className="mb-5">Education</h2>

			<div className="resume-item d-flex justify-content-between mb-5">
				<div className="resume-content me-3 ">
					<h3 className="mb-0">Indian Institute of Technology, Roorkee</h3>
					<div className="subheading mb-3">Bachelor of technology</div>
					<p className="para-content">Chemical Engineering</p>
				</div>
				<div className="resume-date px-4">
					<span className="text-primary">Jul 2018 - Jun 2022</span>
				</div>
			</div>

			<div className="resume-item d-flex justify-content-between mb-5">
				<div className="resume-content me-3 ">
					<h3 className="mb-0">Gulab Rai Montessori</h3>
					<div className="subheading mb-3">PCM with Computer Science</div>
				</div>
				<div className="resume-date px-4">
					<span className="text-primary">Apr 2015 - Mar 2017</span>
				</div>
			</div>
		</div>
	</section>
);

export default Education;
