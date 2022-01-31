import { h } from 'preact';

import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ProjectCard = ({ title, company, date, children }) => (
	<div className="resume-item d-flex justify-content-between mb-5 pt-3">
		<div className="resume-content mr-3 ">
			<h3 className="mb-0">{title}</h3>
			<div className="subheading mb-3 font-italic">{company}</div>
			{children}
		</div>
		<div className="resume-date px-4">
			<span className="text-primary">{date}</span>
		</div>
	</div>
);

ProjectCard.Content = CardContent;
ProjectCard.Paragraph = CardParagraph;

export default ProjectCard;
