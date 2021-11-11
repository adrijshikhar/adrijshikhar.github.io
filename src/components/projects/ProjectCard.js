import CardContent from '../common/CardContent';
import CardParagraph from '../common/CardParagraph';

const ProjectCard = ({ title, company, date, children }) => {
  return (
    <div class="resume-item d-flex justify-content-between mb-5 pt-3">
      <div class="resume-content mr-3 ">
        <h3 class="mb-0">{title}</h3>
        <div class="subheading mb-3 font-italic">{company}</div>
        {children}
      </div>
      <div class="resume-date px-4">
        <span class="text-primary">{date}</span>
      </div>
    </div>
  );
};

ProjectCard.Content = CardContent;
ProjectCard.Paragraph = CardParagraph;

export default ProjectCard;
