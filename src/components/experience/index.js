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
          postition="SDE Intern | Hevo Data"
          location="Bangalore"
          date="Sep 2021 - Oct 2021"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>
              Load data from any source into your warehouse
            </ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Added support for ‘wal2json’ output plugin for postgres
                  logical replication.
                </li>
                <li>
                  Reduced WAL processing time taken by the platform, by 60%.
                </li>
                <li>
                  Implemented dynamic plugin selection using Guice dependency
                  injection.
                </li>
                <li>
                  Ensured stability by benchmarks and unit tests. Tech Stack:
                  Java
                </li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="SDE Intern | MTX Global"
          location="Hydrabad"
          date="Jun 2021 - Aug 2021"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>GO DIGITAL. THINK HUMAN.</ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Worked on curating ETL data pipeline from concept to proof of
                  concept.
                </li>
                <li>
                  Implemented on-demand data transformations using Apache Spark,
                  and streaming the same using Apache Kafka onto Google Cloud
                  Platform.
                </li>
                <li>
                  Containerized individual components of the pipeline for better
                  development and deployment.
                </li>
                <li>
                  Solely configured and maintained pipeline on Google K8s
                  Engine.
                </li>
                <li>
                  Orchestrated data visualization service to configure overlayed
                  charts.
                </li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Full Stack Developer Intern | Triomics"
          location="Gurgaon"
          date="Apr 2021 - May 2021"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>
              Making Clinical Trials faster and transparent
            </ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Collaborated with the core founding team on the initial stages
                  of the platform.
                </li>
                <li>
                  Setup infrastructure for the applications, keeping scalability
                  and security into account.
                </li>
                <li>
                  Developed management dashboard service for micro and macro
                  level user access across the apps.
                </li>
                <li>
                  Customized D3 for visualization of data, fitting our use case.
                </li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="SDE Intern | Rephrase.ai"
          location="Bangalore"
          date="Oct 2020 - March 2021"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>
              Use Generative AI to address millions of customers personally,
              through videos.
            </ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Ensured stability of the product by integrating tests and
                  error handling.
                </li>
                <li>
                  Optimized uploading and validating data from user's end.
                </li>
                <li>
                  Implemented Stripe, Sentry, Clickup for better development
                  cycle.
                </li>
                <li>
                  Integrated continuous integration and ensured continuous
                  delivery among various services.
                </li>
                <li> Worked on graphene to optimize API performance.</li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Software Engineering Intern | Powerplay"
          location="Bangalore"
          date="Apr 2020 - Jun 2020"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>
              Helping construction contractors track realtime on-site progress
            </ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Implemented core features and structure from concept through
                  deployment.
                </li>
                <li>
                  Introduced REST API', server-side pagination and JWT based
                  authentication system.
                </li>
                <li>
                  Standardized UI libraries by enclosing them in highly
                  customizable wrapper for code reusability.
                </li>
                <li>Assessed UX and UI designs for technical feasibility.</li>
                <li>Developed standard and ad hoc report in table format.</li>
                <li>
                  Collaborated with product team members to implement new
                  feature developments.
                </li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Developer | SDSLabs"
          location="IIT Roorkee"
          date="Jan 2019 - Present"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>Think. Build. Ship</ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Under the hood of the group, we promote technical culture on
                  the campus by conducting hackathons, lecture series, and
                  competitions.
                </li>
                <li>
                  Responsible for maintaining current applications and server
                  management.
                </li>
                <li>
                  Mentored freshmen students in their projects for the Winter of
                  Code program.
                </li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Manager | Entrepreneurship Cell"
          location="IIT Roorkee"
          date="Feb 2019 - Feb 2020"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>#inspiringinnovation</ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Conducted meetings, hands-on workshops and events on various
                  topics related to entrepreneurship and startups.
                </li>
                <li>Participated in various case studies regarding SaaS.</li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Senior Member | XDA Developers"
          location="JB Online Media, LLC"
          date="Feb 2015 - Present"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>Open Source Android forum</ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>

        <ExpCard
          postition="Web Developer | Cognizance"
          location="IIT Roorkee"
          date="Dec 2018 - Jan 2020"
        >
          <ExpCard.Content>
            <ExpCard.Paragraph>IIT Roorkee Tech Fest</ExpCard.Paragraph>
            <ExpCard.Paragraph>
              <ul>
                <li>
                  Worked in a 3-tier team of 5+ executive members, associate
                  members, and co-coordinators to establish web presence of
                  Cognizance 2019 and 2020.
                </li>
                <li>Worked as a Manager Web in 2019 and 2020</li>
              </ul>
            </ExpCard.Paragraph>
          </ExpCard.Content>
        </ExpCard>
      </div>
    </section>
  );
};

export default Experience;
