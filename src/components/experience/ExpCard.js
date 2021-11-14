import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ExpCard = ({
  postition,
  companyName,
  companyLink,
  location,
  date,
  ...props
}) => {
  return (
    <div class="resume-item d-flex justify-content-between mb-5">
      <div class="resume-content mr-3 ">
        <h3 class="mb-1">
          {postition} |{' '}
          <a href={companyLink} target="_blank">
            {companyName}
          </a>
        </h3>
        <div class="subheading mb-3 font-italic">{location}</div>
        {props.children}
      </div>
      <div class="resume-date px-4">
        <span class="text-primary">{date}</span>
      </div>
    </div>
  );
};

ExpCard.Content = CardContent;
ExpCard.Paragraph = CardParagraph;

export default ExpCard;
