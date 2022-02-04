import { h } from 'preact';

import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ProjectCard = ({ title, company, date, children, link }) => (
	<div className="resume-item d-flex justify-content-between mb-5 pt-3">
		<div className="resume-content me-3 ">
			<div className="resume-heading-container mb-2">
				<div className="resume-heading">
					{link ? (
						<a
							className="text-decoration-none"
							href={link}
							target="_blank"
							rel="noreferrer"
						>
							<h3 className="mb-0">
								{title}
								<i className="fs-6 fas fa-external-link-alt ms-2"></i>
							</h3>
						</a>
					) : (
						<h3 className="mb-0">{title}</h3>
					)}

					<div className="subheading mb-2 font-italic">{company}</div>
				</div>
				<div className="resume-date px-4 mb-2">
					<span className="text-primary">{date}</span>
				</div>
			</div>
			{children}
		</div>
	</div>
);

ProjectCard.Content = CardContent;
ProjectCard.Paragraph = CardParagraph;

export default ProjectCard;
