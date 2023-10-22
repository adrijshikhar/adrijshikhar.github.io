import { h } from 'preact';

const SideNavigationBar = () => (
	<nav
		className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top"
		id="side-nav"
	>
		<div className="container-fluid">
			<a className="navbar-brand js-scroll-trigger" href="#page-top">
				<span className="d-block d-lg-none">ADRIJ SHIKHAR</span>
				<span className="d-none d-lg-block">
					<img
						className="img-fluid img-profile rounded-circle mx-auto mb-2"
						src="/assets/images/profile.jpeg"
						alt=""
					/>
				</span>
			</a>
			<button
				className="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span className="navbar-toggler-icon"></span>
			</button>
			<div className="collapse navbar-collapse" id="navbarSupportedContent">
				<ul className="navbar-nav nav-pills">
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#about">
							About
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#experience">
							Experience
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#skills">
							Skills
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#projects">
							Projects
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#achievements">
							Achievements
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#education">
							Education
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="#interests">
							Interests
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link js-scroll-trigger" href="/assets/resume.pdf">
							Resume
						</a>
					</li>
				</ul>
			</div>
		</div>
	</nav>
);

export default SideNavigationBar;
