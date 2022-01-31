import { h } from 'preact';

import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ExpCard = ({
	postition,
	companyName,
	companyLink,
	location,
	date,
	...props
}) => (
	<div className="resume-item d-flex justify-content-between mb-5">
		<div className="resume-content mr-3 ">
			<h3 className="mb-1">
				{postition} |{' '}
				<a href={companyLink} target="_blank">
					{companyName}
				</a>
			</h3>
			<div className="subheading mb-3 font-italic">{location}</div>
			{props.children}
		</div>
		<div className="resume-date px-4">
			<span className="text-primary">{date}</span>
		</div>
	</div>
);

ExpCard.Content = CardContent;
ExpCard.Paragraph = CardParagraph;

export default ExpCard;
