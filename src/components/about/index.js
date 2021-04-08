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
        I am a 22-year-old pre final year student enrolled in Chemical
        Engineering at IIT Roorkee. I developed a passion for development in my
        freshmen year and since then most of my time goes into reading and
        writing software.
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
        <a class="icon" href="https://sourcerer.io/adrijshikhar">
          <svg class="svg-icon" width="32" height="41" viewBox="0 0 32 41">
            <g clip-path="url(#clip0)">
              <path
                d="M10.1653 38.0926C10.1653 38.8926 10.3653 39.2926 10.8653 39.2926C11.2653 39.2926 11.4653 38.8926 11.4653 38.0926C11.4653 37.2926 11.2653 36.9926 10.8653 36.9926C10.3653 36.9926 10.1653 37.2926 10.1653 38.0926ZM10.8653 40.0926C9.86533 40.0926 9.46533 39.4926 9.46533 38.1926C9.46533 36.9926 9.96533 36.3926 10.8653 36.3926C11.7653 36.3926 12.1653 36.9926 12.1653 38.1926C12.1653 39.3926 11.3653 40.0926 10.4653 40.0926"
                fill="white"
              />
              <path
                d="M6.16553 39.8925V39.7925L10.2655 33.2925H10.9655L6.96553 39.8925H6.26553"
                fill="white"
              />
              <path
                d="M5.86514 34.9924C5.86514 35.7924 6.06514 36.1924 6.56514 36.1924C6.96514 36.1924 7.16514 35.7924 7.16514 34.9924C7.26514 34.1924 7.06514 33.8924 6.66514 33.8924C6.16514 33.8924 5.96514 34.0924 5.96514 34.9924H5.86514ZM5.26514 35.0924C5.26514 33.7924 5.76514 33.1924 6.66514 33.1924C7.46514 33.1924 7.96514 33.7924 7.96514 34.9924C7.96514 36.2924 7.46514 36.8924 6.66514 36.8924C5.66514 36.8924 5.26514 36.2924 5.26514 34.9924"
                fill="white"
              />
              <path
                d="M4.82812 26.8926V25.8926H5.82812V26.8926H4.82812Z"
                fill="white"
              />
              <path
                d="M1.12842 28.3926V27.7926H2.12842V26.9926C2.12842 26.2926 2.62842 25.8926 3.52842 25.8926H4.12842V26.6926H3.52842L3.22842 26.7926L3.12842 27.1926V27.6926H5.62842V32.4926H4.82842V28.4926H3.12842V32.4926H2.22842V28.4926H1.12842V28.3926ZM31.9284 29.2926C31.9284 27.2926 30.5284 25.8926 28.7284 25.8926C27.8532 25.8926 27.0138 26.2403 26.395 26.8591C25.7761 27.478 25.4284 28.3174 25.4284 29.1926C25.4362 30.0654 25.7864 30.9002 26.4036 31.5174C27.0208 32.1346 27.8556 32.4847 28.7284 32.4926C30.5284 32.4926 31.9284 30.9926 31.9284 29.1926V29.2926ZM16.4284 33.1926C15.5532 33.1926 14.7138 33.5403 14.095 34.1591C13.4761 34.778 13.1284 35.6174 13.1284 36.4926C13.1362 37.3654 13.4864 38.2002 14.1036 38.8174C14.7208 39.4346 15.5556 39.7848 16.4284 39.7926C18.2284 39.7926 19.6284 38.2926 19.6284 36.4926C19.6284 34.6926 18.2284 33.1926 16.4284 33.1926ZM16.4284 33.9926C17.7284 33.9926 18.8284 35.0926 18.8284 36.4926C18.8284 37.8926 17.8284 38.9926 16.4284 38.9926C15.7654 38.9926 15.1295 38.7292 14.6607 38.2603C14.1918 37.7915 13.9284 37.1556 13.9284 36.4926C13.9284 35.0926 15.0284 33.9926 16.4284 33.9926Z"
                fill="white"
              />
              <path
                d="M2.61878 18L4.31878 19.4C6.55738 20.4295 8.90581 21.2012 11.3188 21.7L13.7188 22L16.0188 22.3C16.7183 22.4035 17.4183 22.5035 18.1188 22.6L19.3188 22.8C20.1323 22.9414 20.9344 23.142 21.7188 23.4C22.6934 23.6302 23.5901 24.113 24.3188 24.8H32.0188L31.7188 23.8C30.7188 20.8 28.3188 18.7 24.3188 17.5C21.1951 16.737 18.0201 16.2023 14.8188 15.9L13.2188 15.6L12.0188 15.4L10.8188 15.2L9.41878 14.6L8.11878 13.8C7.79127 13.4817 7.52069 13.1097 7.31878 12.7L7.01878 11.2C7.01878 9.9 7.71878 8.8 9.01878 7.8C10.4188 6.8 12.4188 6.3 15.0188 6.3C17.9188 6.3 20.2188 7 21.8188 8.2C22.5916 8.77881 23.2134 9.53558 23.6312 10.4061C24.049 11.2765 24.2506 12.235 24.2188 13.2C24.2188 13.4 24.2188 13.5 24.5188 13.5H31.0188C31.2188 13.5 31.2188 13.5 31.2188 13.2C31.2982 10.6547 30.5792 8.14828 29.1625 6.03217C27.7458 3.91606 25.7024 2.29632 23.3188 1.4C20.8188 0.4 18.1188 0 15.0188 0C10.5188 0 6.91878 1 4.01878 3.2C2.74058 4.10368 1.70006 5.30328 0.986104 6.69638C0.272144 8.08947 -0.0940533 9.63466 -0.0812168 11.2C-0.0818488 12.9381 0.329386 14.6515 1.11878 16.2C1.41878 16.8 1.91878 17.4 2.51878 18L2.61878 18Z"
                fill="white"
              />
              <path
                d="M20.3281 40.2011H26.9281V33.6011H20.3281V40.2011Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="32" height="41" fill="white" />
              </clipPath>
            </defs>
          </svg>
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
