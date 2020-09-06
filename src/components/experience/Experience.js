import ExpCard from './ExpCard';

const Experience = () => {
  return (
    <section
      class="resume-section p-3 p-lg-5 d-flex flex-column"
      id="experience"
    >
      <div class="my-auto">
        <h2 class="mb-5">Experience</h2>
        <ExpCard
          postition="Software Engineering Intern | Powerplay"
          location="Bangalore"
          date="Apr 2020 - Jun 2020"
        >
          <p class="para-content">
            Helping construction contractors track realtime on-site progress
          </p>
        </ExpCard>

        <ExpCard
          postition="Developer | SDSLabs"
          location="IIT Roorkee"
          date="Jan 2019 - Present"
        >
          <p class="para-content">Think. Build. Ship</p>
        </ExpCard>

        <ExpCard
          postition="Manager | Entrepreneurship Cell"
          location="IIT Roorkee"
          date="Feb 2019 - Feb 2020"
        >
          <p class="para-content">#inspiringinnovation</p>
        </ExpCard>

        <ExpCard
          postition="Senior Member | XDA Developers"
          location="JB Online Media, LLC"
          date="Feb 2015 - Present"
        >
          <p class="para-content">Tech Fest</p>
        </ExpCard>

        <ExpCard
          postition="Developer | SDSLabs"
          location="IIT Roorkee"
          date="Jan 2019 - Present"
        >
          <p class="para-content">Android Community</p>
        </ExpCard>
      </div>
    </section>
  );
};

export default Experience;
