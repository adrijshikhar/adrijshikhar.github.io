import { h } from 'preact';

const Achievements = () => (
	<section
		className="resume-section p-3 p-lg-5 d-flex flex-column"
		id="achievements"
	>
		<div className="my-auto">
			<h2 className="mb-5">Achievements</h2>
			<ul className="fa-ul mb-0">
				<li>
					<span className="fa-li">
						<i className="fas fa-trophy text-warning"></i>
					</span>
					1<sup>st</sup> Place - CSAW Embedded Security Challenge 2020 -
					National level
				</li>
				<li>
					<span className="fa-li">
						<i className="fas fa-trophy text-warning"></i>
					</span>
					3<sup>rd</sup> Place - CSAW Embedded Security Challenge 2020 -
					Globally
				</li>
			</ul>
		</div>
	</section>
);

export default Achievements;
