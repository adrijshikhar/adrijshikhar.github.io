const About = () => {
  return (
    <section
      class="resume-section p-3 p-lg-5 d-flex flex-column justify-content-center"
      id="about"
    >
      <h1 class="mb-4 d-flex flex-wrap">
        <span class="mr-1">Adrij</span>
        <span class="text-primary">Shikhar</span>
      </h1>
      <p class="lead mb-5">
        I am a 23-year-old final year student enrolled in Chemical Engineering
        at IIT Roorkee. I developed a passion for development in my freshmen
        year and since then most of my time goes into reading and writing
        software.
      </p>
      <div class="social-icons">
        <a
          class="icon"
          href="https://www.linkedin.com/in/adrij-shikhar-460a89111/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fab fa-linkedin-in"></i>
        </a>
        <a
          class="icon"
          href="https://github.com/adrijshikhar/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fab fa-github"></i>
        </a>
        <a
          class="icon"
          href="mailto:ashikhar@ee.iitr.ac.in"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fa fa-envelope"></i>
        </a>
        <a
          class="icon"
          href="https://dev.to/adrijshikhar"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fab fa-dev" title="adrijshikhar's DEV Profile"></i>
        </a>
        <a
          class="icon"
          href="https://www.reddit.com/user/nemesis0009"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fab fa-reddit"></i>
        </a>
        <a
          class="icon"
          href="https://www.facebook.com/adrij.shikhar"
          target="_blank"
          rel="noreferrer noopener"
        >
          <i class="fab fa-facebook-f"></i>
        </a>
        <button
          type="button"
          class="icon fa fa-mobile"
          data-toggle="tooltip"
          data-placement="bottom"
          title="+91 (821) 805-8928"
        ></button>
        <a
          class="icon"
          data-toggle="tooltip"
          data-placement="bottom"
          title="Download Resume"
          href="/assets/resume.pdf"
          download="Adrij Shikhar Resume.pdf"
        >
          <i class="fas fa-download"></i>
        </a>
      </div>
    </section>
  );
};

export default About;
