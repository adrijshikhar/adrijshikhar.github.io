import { h } from 'preact';

import Tick from '../common/Tick';
import DevIcon from './DevIcon';

const Skills = () => (
	<section className="resume-section p-3 p-lg-5 d-flex flex-column" id="skills">
		<div className="my-auto">
			<h2 className="mb-5">Skills</h2>

			<h4 className="mb-3">Development Environment</h4>
			<ul className="fa-ul mb-4">
				<li>
					<i className="fa-li fab fa-linux"></i>
					<span className="me-2"> OS:</span> Manjaro i3wm Community Edition
				</li>
				<li>
					<i className="fa-li fas fa-code"></i>
					<span className="me-2"> IDE:</span> Highly customized [ VS Code |
					Intellij ] with self crafted theme
				</li>
				<li>
					<i className="fa-li fas fa-terminal fs-6"></i>
					<span className="me-2"> Shell:</span> Bash, Oh My Zsh, fish-shell, Oh
					My Fish
				</li>
			</ul>

			<h4 className="mb-3">Frameworks & Tools</h4>
			<div className="dev-icons mb-3">
				<DevIcon className="fab fa-js-square" />
				<DevIcon className="fab fa-react" />
				<DevIcon className="fab fa-node-js" />
				<DevIcon className="fab fa-python" />
				<DevIcon>
					<svg
						fill="#868e96"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 50 50"
						width="100px"
						height="100px"
					>
						<path
							className="icon"
							d="M50,24.939C50,28.564,47.573,31,43.961,31c-1.332,0-2.499-0.333-3.441-0.934c-0.151,0.843-0.414,1.576-0.867,2.258 C38.847,33.545,37.197,35,33.909,35c-1.244,0-2.332-0.192-3.423-0.605l-1.292-0.489V31c0,0-10.791,0-11.29,0 c-0.966,0-1.734-0.148-2.36-0.384c-0.099,0.29-0.208,0.573-0.352,0.846c-0.618,1.2-1.471,1.988-2.945,2.721l-0.867,0.431 l-0.876-0.413L8.169,33.1l-5.267-2.924l0.011-0.001C1.047,29.198,0,27.392,0,24.944c0-3.413,2.25-5.869,5.561-6.197V17v-2h10.456v2 v2.397C16.874,19.14,17.747,19,18.662,19c1.366,0,2.313,0.329,2.983,0.772l0.528-0.144C23.764,19.194,25.077,19,26.431,19 c1.788,0,3.16,0.497,4.081,1.479c0.132,0.141,0.247,0.284,0.353,0.43C32.094,19.77,33.992,19,36.758,19 c1.188,0,2.322,0.119,3.677,0.387l0.877,0.173C42.116,19.2,43.038,19,44.059,19C47.612,19,50,21.387,50,24.939z M7.561,17v3.839 c-0.376-0.097-0.825-0.13-1.233-0.13C3.697,20.709,2,22.376,2,24.944C2,27.609,3.6,28.997,6.675,29 c1.027,0,2.036-0.097,3.325-0.343V17H7.561L7.561,17z M7.561,22.865v4.044c-0.36,0.049-0.724,0.065-1.003,0.065 c-1.289,0-1.992-0.739-1.992-2.078c0-1.375,0.735-2.16,2.008-2.16C6.885,22.736,7.266,22.768,7.561,22.865L7.561,22.865z M11.487,21v4.916c0,2.169-0.113,2.994-0.473,3.706c-0.343,0.696-0.881,1.153-1.992,1.669l2.336,1.101 c1.111-0.552,1.649-1.052,2.057-1.845C13.852,29.722,14,28.765,14,26.776V21H11.487z M11.5,19.558h2.517V17H11.5V19.558z M15.496,23.596c0.933-0.486,1.928-0.739,2.812-0.739c0.604,0,0.822,0.159,0.822,0.598v0.533c-2.935,0.25-4.13,1.035-4.13,2.734 C15,28.293,15.899,29,17.904,29c0.992,0,2.344-0.112,3.416-0.268v-4.918c0-1.007-0.065-1.477-0.265-1.839 C20.698,21.33,19.891,21,18.662,21c-1.103,0-2.113,0.221-3.169,0.723L15.496,23.596z M19.237,25.572v1.621 c-0.465,0.078-0.791,0.109-1.148,0.109c-0.653,0-0.949-0.221-0.949-0.692C17.14,25.98,17.655,25.728,19.237,25.572L19.237,25.572z M22.7,29H25v-5.843c0.477-0.146,0.843-0.177,1.168-0.177c0.847,0,1.243,0.352,1.243,1.295V29h2.29v-4.823 c0-1.229-0.157-1.805-0.649-2.331C28.529,21.288,27.648,21,26.431,21c-1.171,0-2.327,0.174-3.731,0.557V29z M31.195,30.268v2.256 C32.077,32.858,32.927,33,33.909,33c1.931,0,3.29-0.589,4.075-1.778c0.538-0.812,0.72-1.794,0.72-3.889v-0.667 c-0.017-0.334-0.017-0.667-0.033-1.001l-0.016-1.334L38.623,23.3v-0.255c0.506,0.047-0.11-0.06,0.561,0.066l0.863-1.762 C38.837,21.11,37.838,21,36.758,21C33.079,21,31,22.57,31,25.348c0,2.237,1.405,3.65,3.613,3.65c0.652,0,1.145-0.098,1.635-0.334 v0.047c0,1.554-0.704,2.206-2.355,2.206C32.959,30.917,32.077,30.712,31.195,30.268L31.195,30.268z M36.2,23.158l0.017,0.809 l0.016,1.126c0,0.334,0.017,0.651,0.017,0.938v0.667v0.177c-0.324,0.095-0.604,0.157-0.947,0.157c-1.113,0-1.735-0.699-1.735-1.919 c0-0.856,0.311-1.46,0.914-1.793c0.393-0.239,0.967-0.365,1.457-0.349h0.182H36.2V23.158z M40,25.077 C40,27.497,41.511,29,43.961,29C46.443,29,48,27.435,48,24.939C48,22.504,46.505,21,44.059,21C41.561,21,40.004,22.565,40,25.077z M44.008,27.075c-0.952,0-1.511-0.759-1.511-2.078c0-1.319,0.556-2.078,1.527-2.078c0.939,0,1.478,0.775,1.478,2.078 C45.503,26.316,44.948,27.075,44.008,27.075L44.008,27.075z"
						/>
					</svg>
				</DevIcon>
				<DevIcon className="fab fa-docker" />
				<DevIcon>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						width="64"
						height="64"
					>
						<path
							d="M15.9.476a2.14 2.14 0 0 0-.823.218L3.932 6.01c-.582.277-1.005.804-1.15 1.432L.054 19.373c-.13.56-.025 1.147.3 1.627q.057.087.12.168l7.7 9.574c.407.5 1.018.787 1.662.784h12.35c.646.001 1.258-.3 1.664-.793l7.696-9.576c.404-.5.555-1.16.4-1.786L29.2 7.43c-.145-.628-.57-1.155-1.15-1.432L16.923.695A2.14 2.14 0 0 0 15.89.476z"
							fill="#868e96"
							className="icon"
						/>
						<path
							d="M16.002 4.542c-.384.027-.675.356-.655.74v.188c.018.213.05.424.092.633a6.22 6.22 0 0 1 .066 1.21c-.038.133-.114.253-.218.345l-.015.282c-.405.034-.807.096-1.203.186-1.666.376-3.183 1.24-4.354 2.485l-.24-.17c-.132.04-.274.025-.395-.04a6.22 6.22 0 0 1-.897-.81 5.55 5.55 0 0 0-.437-.465l-.148-.118c-.132-.106-.294-.167-.463-.175a.64.64 0 0 0-.531.236c-.226.317-.152.756.164.983l.138.11a5.55 5.55 0 0 0 .552.323c.354.197.688.428.998.7a.74.74 0 0 1 .133.384l.218.2c-1.177 1.766-1.66 3.905-1.358 6.006l-.28.08c-.073.116-.17.215-.286.288a6.22 6.22 0 0 1-1.194.197 5.57 5.57 0 0 0-.64.05l-.177.04h-.02a.67.67 0 0 0-.387 1.132.67.67 0 0 0 .684.165h.013l.18-.02c.203-.06.403-.134.598-.218.375-.15.764-.265 1.162-.34.138.008.27.055.382.135l.3-.05c.65 2.017 2.016 3.726 3.84 4.803l-.122.255c.056.117.077.247.06.376-.165.382-.367.748-.603 1.092a5.58 5.58 0 0 0-.358.533l-.085.18a.67.67 0 0 0 .65 1.001.67.67 0 0 0 .553-.432l.083-.17c.076-.2.14-.404.192-.61.177-.437.273-.906.515-1.196a.54.54 0 0 1 .286-.14l.15-.273a8.62 8.62 0 0 0 6.146.015l.133.255c.136.02.258.095.34.205.188.358.34.733.456 1.12a5.57 5.57 0 0 0 .194.611l.083.17a.67.67 0 0 0 1.187.131.67.67 0 0 0 .016-.701l-.087-.18a5.55 5.55 0 0 0-.358-.531c-.23-.332-.428-.686-.6-1.057a.52.52 0 0 1 .068-.4 2.29 2.29 0 0 1-.111-.269c1.82-1.085 3.18-2.8 3.823-4.82l.284.05c.102-.093.236-.142.373-.138.397.076.786.2 1.162.34.195.09.395.166.598.23.048.013.118.024.172.037h.013a.67.67 0 0 0 .841-.851.67.67 0 0 0-.544-.446l-.194-.046a5.57 5.57 0 0 0-.64-.05c-.404-.026-.804-.092-1.194-.197-.12-.067-.22-.167-.288-.288l-.27-.08a8.65 8.65 0 0 0-1.386-5.993l.236-.218c-.01-.137.035-.273.124-.378.307-.264.64-.497.99-.696a5.57 5.57 0 0 0 .552-.323l.146-.118a.67.67 0 0 0-.133-1.202.67.67 0 0 0-.696.161l-.148.118a5.57 5.57 0 0 0-.437.465c-.264.302-.556.577-.873.823a.74.74 0 0 1-.404.044l-.253.18c-1.46-1.53-3.427-2.48-5.535-2.67 0-.1-.013-.25-.015-.297-.113-.078-.192-.197-.218-.332a6.23 6.23 0 0 1 .076-1.207c.043-.21.073-.42.092-.633v-.2c.02-.384-.27-.713-.655-.74zm-.834 5.166l-.2 3.493h-.015c-.01.216-.137.4-.332.504s-.426.073-.6-.054l-2.865-2.03a6.86 6.86 0 0 1 3.303-1.799c.234-.05.47-.088.707-.114zm1.668 0c1.505.187 2.906.863 3.99 1.924l-2.838 2.017c-.175.14-.415.168-.618.072s-.333-.3-.336-.524zm-6.72 3.227l2.62 2.338v.015c.163.142.234.363.186.574s-.21.378-.417.435v.01l-3.362.967a6.86 6.86 0 0 1 .974-4.34zm11.753 0c.796 1.295 1.148 2.814 1.002 4.327l-3.367-.97v-.013c-.21-.057-.37-.224-.417-.435s.023-.43.186-.574l2.6-2.327zm-6.404 2.52h1.072l.655.832-.238 1.04-.963.463-.965-.463-.227-1.04zm3.434 2.838c.045-.005.1-.005.135 0l3.467.585c-.5 1.44-1.487 2.67-2.775 3.493l-1.34-3.244a.59.59 0 0 1 .509-.819zm-5.823.015c.196.003.377.104.484.268s.124.37.047.55v.013l-1.332 3.218C11 21.54 10.032 20.325 9.517 18.9l3.437-.583c.038-.004.077-.004.116 0zm2.904 1.4a.59.59 0 0 1 .537.308h.013l1.694 3.057-.677.2c-1.246.285-2.547.218-3.758-.194l1.7-3.057c.103-.18.293-.29.5-.295z"
							fill="#fff"
							stroke="#fff"
							strokeWidth=".055"
						/>
					</svg>
				</DevIcon>
				<DevIcon className="fab fa-java" />
				<DevIcon className="fab fa-aws" />
				<DevIcon>
					<svg viewBox="0 0 128 128">
						<path
							className="icon"
							fill="#868e96"
							d="M108.2 64.8c-.1-.1-.2-.2-.4-.2l-.1-.1c-.1-.1-.2-.1-.2-.2l-.1-.1c-.1 0-.2-.1-.2-.1l-.2-.1c-.1 0-.2-.1-.2-.1l-.2-.1c-.1 0-.2-.1-.2-.1-.1 0-.1 0-.2-.1l-.3-.1c-.1 0-.1 0-.2-.1l-.3-.1h-.1l-.4-.1h-.2c-.1 0-.2 0-.3-.1h-2.3c-.6-13.3.6-26.8-2.8-39.6 12.9-4.6 2.8-22.3-8.4-14.4-7.4-6.4-17.6-7.8-28.3-7.8-10.5.7-20.4 2.9-27.4 8.4-2.8-1.4-5.5-1.8-7.9-1.1v.1c-.1 0-.3.1-.4.2-.1 0-.3.1-.4.2h-.1c-.1 0-.2.1-.4.2h-.1l-.3.2h-.1l-.3.2h-.1l-.3.2s-.1 0-.1.1l-.3.2s-.1 0-.1.1l-.3.2s-.1 0-.1.1l-.3.2-.1.1c-.1.1-.2.1-.2.2l-.1.1-.2.2-.1.1c-.1.1-.1.2-.2.2l-.1.1c-.1.1-.1.2-.2.2l-.1.1c-.1.1-.1.2-.2.2l-.1.1c-.1.1-.1.2-.2.2l-.1.1c-.1.1-.1.2-.2.2l-.1.1-.1.3s0 .1-.1.1l-.1.3s0 .1-.1.1l-.1.3s0 .1-.1.1l-.1.3s0 .1-.1.1c.4.3.4.4.4.4v.1l-.1.3v.1c0 .1 0 .2-.1.3v3.1c0 .1 0 .2.1.3v.1l.1.3v.1l.1.3s0 .1.1.1l.1.3s0 .1.1.1l.1.3s0 .1.1.1l.2.3s0 .1.1.1l.2.3s0 .1.1.1l.2.3.1.1.3.3.3.3h.1c1 .9 2 1.6 4 2.2v-.2c-4.2 12.6-.7 25.3-.5 38.3-.6 0-.7.4-1.7.5h-.5c-.1 0-.3 0-.5.1-.1 0-.3 0-.4.1l-.4.1h-.1l-.4.1h-.1l-.3.1h-.1l-.3.1s-.1 0-.1.1l-.3.1-.2.1c-.1 0-.2.1-.2.1l-.2.1-.2.1c-.1 0-.2.1-.2.1l-.2.1-.4.3c-.1.1-.2.2-.3.2l-.4.4-.1.1c-.1.2-.3.4-.4.5l-.2.3-.3.6-.1.3v.3c0 .5.2.9.9 1.2.2 3.7 3.9 2 5.6.8l.1-.1c.2-.2.5-.3.6-.3h.1l.2-.1c.1 0 .1 0 .2-.1.2-.1.4-.1.5-.2.1 0 .1-.1.1-.2l.1-.1c.1-.2.2-.6.2-1.2l.1-1.3v1.8c-.5 13.1-4 30.7 3.3 42.5 1.3 2.1 2.9 3.9 4.7 5.4h-.5c-.2.2-.5.4-.8.6l-.9.6-.3.2-.6.4-.9.7-1.1 1c-.2.2-.3.4-.4.5l-.4.6-.2.3c-.1.2-.2.4-.2.6l-.1.3c-.2.8 0 1.7.6 2.7l.4.4h.2c.1 0 .2 0 .4.1.2.4 1.2 2.5 3.9.9 2.8-1.5 4.7-4.6 8.1-5.1l-.5-.6c5.9 2.8 12.8 4 19 4.2 8.7.3 18.6-.9 26.5-5.2 2.2.7 3.9 3.9 5.8 5.4l.1.1.1.1.1.1.1.1s.1 0 .1.1c0 0 .1 0 .1.1 0 0 .1 0 .1.1h2.1000000000000005s.1 0 .1-.1h.1s.1 0 .1-.1h.1s.1 0 .1-.1c0 0 .1 0 .1-.1l.1-.1s.1 0 .1-.1l.1-.1h.1l.2-.2.2-.1h.1l.1-.1h.1l.1-.1.1-.1.1-.1.1-.1.1-.1.1-.1.1-.1v-.1s0-.1.1-.1v-.1s0-.1.1-.1v-.1s0-.1.1-.1v-1.4000000000000001s-.3 0-.3-.1l-.3-.1v-.1l.3-.1s.2 0 .2-.1l.1-.1v-2.1000000000000005s0-.1-.1-.1v-.1s0-.1-.1-.1v-.1s0-.1-.1-.1c0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1 0 0 0-.1-.1-.1l-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1v-.1l-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1-.1c2-1.9 3.8-4.2 5.1-6.9 5.9-11.8 4.9-26.2 4.1-39.2h.1c.1 0 .2.1.2.1h.30000000000000004s.1 0 .1.1h.1s.1 0 .1.1l.2.1c1.7 1.2 5.4 2.9 5.6-.8 1.6.6-.3-1.8-1.3-2.5zm-72.2-41.8c-3.2-16 22.4-19 23.3-3.4.8 13-20 16.3-23.3 3.4zm36.1 15c-1.3 1.4-2.7 1.2-4.1.7 0 1.9.4 3.9.1 5.9-.5.9-1.5 1-2.3 1.4-1.2-.2-2.1-.9-2.6-2l-.2-.1c-3.9 5.2-6.3-1.1-5.2-5-1.2.1-2.2-.2-3-1.5-1.4-2.6.7-5.8 3.4-6.3.7 3 8.7 2.6 10.1-.2 3.1 1.5 6.5 4.3 3.8 7.1zm-7-17.5c-.9-13.8 20.3-17.5 23.4-4 3.5 15-20.8 18.9-23.4 4zM41.7 17c-1.9 0-3.5 1.7-3.5 3.8 0 2.1 1.6 3.8 3.5 3.8s3.5-1.7 3.5-3.8c0-2.1-1.5-3.8-3.5-3.8zm1.6 5.7c-.5 0-.8-.4-.8-1 0-.5.4-1 .8-1 .5 0 .8.4.8 1 0 .5-.3 1-.8 1zM71.1 16.1c-1.9 0-3.4 1.7-3.4 3.8 0 2.1 1.5 3.8 3.4 3.8s3.4-1.7 3.4-3.8c0-2.1-1.5-3.8-3.4-3.8zm1.6 5.6c-.4 0-.8-.4-.8-1 0-.5.4-1 .8-1s.8.4.8 1-.4 1-.8 1z"
						/>
					</svg>
				</DevIcon>
				<DevIcon>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						stroke="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="#868e96"
						fillRule="nonzero"
						viewBox="0 0 60 67"
					>
						<path
							className="icon"
							d="M6.2504 49.8421l-2.3466-1.3568L30.0755 3.1562l2.3467 1.3568z"
						/>
						<path className="icon" d="M3.364 44.8629h52.3477v2.7136H3.364z" />
						<path
							className="icon"
							d="M30.5832 61.5071L4.4008 46.3903l1.3568-2.3467L31.94 59.1604zm22.7456-39.4027L27.1443 6.9898l1.3568-2.3467 26.1824 15.1168z"
						/>
						<path
							className="icon"
							d="M5.764 22.0959l-1.3568-2.3466L30.6131 4.6282l1.3568 2.3467z"
						/>
						<path
							className="icon"
							d="M52.8466 49.842L26.6706 4.5087l2.3467-1.3568 26.176 45.3333zM5.4397 17.9487h2.7136v30.2336H5.4397zm45.4997 0h2.7137v30.2336h-2.7137z"
						/>
						<path
							className="icon"
							d="M30.1224 60.3573l-1.184-2.0523 22.7733-13.1477 1.184 2.0523z"
						/>
						<path
							className="icon"
							d="M57.2478 49.0655c-1.5784 2.7257-5.064 3.6615-7.7953 2.0928-2.7257-1.5783-3.6615-5.0639-2.0927-7.7952 1.5783-2.7257 5.0639-3.6615 7.7951-2.0928 2.7456 1.5851 3.6779 5.0667 2.0907 7.7952M11.716 22.7701c-1.5783 2.7257-5.0639 3.6615-7.7952 2.0928-2.727-1.5784-3.6629-5.0656-2.0928-7.7974 1.5784-2.7257 5.064-3.6615 7.7952-2.0928 2.7257 1.5784 3.6615 5.064 2.0928 7.7952M1.8451 49.0655c-1.5687-2.7312-.6329-6.2168 2.0928-7.7952 2.7312-1.5687 6.2168-.6329 7.7952 2.0928 1.5687 2.7313.6329 6.2169-2.0928 7.7952-2.7456 1.568-6.2294.64-7.7952-2.0906m45.5317-26.2955c-1.5687-2.7313-.6329-6.2169 2.0928-7.7952 2.7313-1.5687 6.2169-.6329 7.7952 2.0928 1.5687 2.7313.6329 6.2169-2.0928 7.7952-2.7313 1.5687-6.2169.6329-7.7952-2.0928M29.5464 65.0655c-2.3075 0-4.3877-1.3901-5.2705-3.522a5.705 5.705 0 0 1 7.455-7.4522 5.705 5.705 0 0 1 3.5201 5.2718c-.0083 3.1468-2.5578 5.6954-5.7046 5.7024m0-52.5909a5.696 5.696 0 0 1-5.7045-5.7045c0-2.0377 1.0871-3.9206 2.8517-4.9394a5.704 5.704 0 0 1 5.7035 0c1.7646 1.0188 2.8517 2.9017 2.8517 4.9394.0017 1.5129-.5985 2.9643-1.6683 4.034a5.696 5.696 0 0 1-4.0341 1.6684"
						/>
					</svg>
				</DevIcon>
				<DevIcon className="fab fa-github" />
				<DevIcon>
					<svg
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 172 172"
					>
						<g transform="translate(-25.8,-25.8) scale(1.2,1.2)">
							<g
								fill="none"
								fillRule="nonzero"
								stroke="none"
								strokeWidth="1"
								strokeLinecap="butt"
								strokeLinejoin="miter"
								strokeMiterlimit="10"
								strokeDasharray=""
								strokeDashoffset="0"
								fontFamily="none"
								fontWeight="none"
								fontSize="none"
								textAnchor="none"
							>
								<path d="M0,172v-172h172v172z" fill="none"></path>
								<g fill="#868e96">
									<path
										className="icon"
										d="M21.5,35.83333v100.33333c0,7.91917 6.41417,14.33333 14.33333,14.33333h100.33333c7.91917,0 14.33333,-6.41417 14.33333,-14.33333v-100.33333c0,-7.91917 -6.41417,-14.33333 -14.33333,-14.33333h-100.33333c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333zM97.93967,89.23217h-15.179v46.9345h-12.2335v-46.9345h-14.86367v-10.39883h42.27617zM100.319,133.48633v-12.54883c0,0 6.85133,5.16717 15.07867,5.16717c8.22733,0 7.90483,-5.375 7.90483,-6.11317c0,-7.8045 -23.29883,-7.8045 -23.29883,-25.0905c0,-23.51383 33.9485,-14.233 33.9485,-14.233l-0.42283,11.17283c0,0 -5.69033,-3.79833 -12.126,-3.79833c-6.4285,0 -8.7505,3.06017 -8.7505,6.32817c0,8.43517 23.51383,7.5895 23.51383,24.56733c0,26.144 -35.84767,14.54833 -35.84767,14.54833z"
									></path>
								</g>
								<path d="" fill="none"></path>
							</g>
						</g>
					</svg>
				</DevIcon>

				<DevIcon>
					<svg version="1.1" viewBox="0 0 226 226">
						<g
							fill="none"
							fillRule="nonzero"
							stroke="none"
							strokeWidth="1"
							strokeLinecap="butt"
							strokeLinejoin="miter"
							strokeMiterlimit="10"
							strokeDasharray=""
							strokeDashoffset="0"
							fontFamily="none"
							fontWeight="none"
							fontSize="none"
							textAnchor="none"
							style={{ 'mix-blend-mode': 'normal' }}
						>
							<path d="M0,226v-226h226v226z" fill="none"></path>
							<g>
								<path
									className="icon"
									d="M122.41667,18.83333l-94.16667,94.16667l28.25,28.25l122.41667,-122.41667z"
									fill="#868e96"
								></path>
								<path
									className="icon"
									d="M178.91667,103.58333l-51.79167,51.79167l-28.25,-28.25l23.54167,-23.54167z"
									fill="#868e96"
								></path>
								<rect
									className="icon"
									x="-12.72895"
									y="33.94062"
									transform="rotate(-45.001) scale(4.70833,4.70833)"
									width="8.485"
									height="8.485"
									fill="#484848"
								></rect>
								<path
									className="icon"
									d="M178.91667,207.16667h-56.5l-23.54167,-23.54167l28.25,-28.25z"
									fill="#666666"
								></path>
								<path
									className="icon"
									d="M98.875,183.625l42.375,-14.125l-14.125,-14.125z"
									fill="#333333"
								></path>
							</g>
						</g>
					</svg>
				</DevIcon>
				<DevIcon className="fab fa-sass" />
				<DevIcon className="fab fa-npm" />
				<DevIcon className="fab fa-html5" />
				<DevIcon className="fab fa-css3-alt" />
			</div>
			<h4 className="mb-3">And More...</h4>

			<div className="fa-ul mb-0">
				<li>
					<Tick /> Redux
				</li>
				<li>
					<Tick /> Dartlang
				</li>
				<li>
					<Tick /> MongoDB
				</li>
				<li>
					<Tick /> PHP
				</li>
				<li>
					<Tick /> C++
				</li>
				<li>
					<Tick /> SQL
				</li>
				<li>
					<Tick /> MySQL
				</li>
				<li>
					<Tick /> PostgreSQL
				</li>
				<li>
					<Tick /> Git
				</li>
				<li>
					<Tick /> Linux
				</li>
				<li>
					<Tick /> Java Server Pages
				</li>
			</div>
		</div>
	</section>
);

export default Skills;
