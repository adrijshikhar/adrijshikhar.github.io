import { h } from 'preact';

import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ExpCard = ({
	position,
	companyName,
	companyLink,
	location,
	date,
	...props
}) => (
	<div className="resume-item d-flex justify-content-between mb-5">
		<div className="resume-content me-3 ">
			<div className="resume-heading-container mb-2">
				<div className="resume-heading">
					<h3 className="mb-0">
						{position} |{' '}
						<a
							className="text-decoration-none"
							href={companyLink}
							target="_blank"
							rel="noreferrer"
						>
							{companyName}
							<i className="fs-5 fas fa-external-link-alt ms-2"></i>
						</a>
					</h3>
					<div className="subheading mb-2 font-italic">{location}</div>
				</div>
				<div className="resume-date px-4 mb-2">
					<span className="text-primary">{date}</span>
				</div>
			</div>
			{props.children}
		</div>
	</div>
);

ExpCard.Content = CardContent;
ExpCard.Paragraph = CardParagraph;

export default ExpCard;
