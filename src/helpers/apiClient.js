import axios from 'axios';

const apiClient = (baseURL = '/', headers = {}) =>
	axios.create({
		baseURL,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});

export default apiClient;
