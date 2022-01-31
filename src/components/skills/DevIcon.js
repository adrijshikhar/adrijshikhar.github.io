import { h } from 'preact';

const DevIcon = ({ className, ...props }) => (
	<div className="list-item">
		{className ? <i className={className}></i> : props.children}
	</div>
);
export default DevIcon;
