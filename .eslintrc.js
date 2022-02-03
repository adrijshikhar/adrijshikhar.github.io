const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8')
);

module.exports = {
	extends: [
		'airbnb',
		'prettier',
		'preact',
		'eslint:recommended',
		'plugin:react/recommended',
	],
	plugins: ['react', 'prettier', 'import', 'simple-import-sort'],
	ignorePatterns: ['build/', 'assets/'],
	rules: {
		'prettier/prettier': ['error', prettierOptions],
		'arrow-body-style': [2, 'as-needed'],
		'class-methods-use-this': 0,
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-dynamic-require': 0,
		'import/no-extraneous-dependencies': 0,
		'import/no-named-as-default': 0,
		'import/no-unresolved': 0,
		'import/extensions': 0,
		'import/no-webpack-loader-syntax': 0,
		'import/order': 'off',
		'import/prefer-default-export': 0,
		'jsx-a11y/alt-text': 0,
		'jsx-a11y/control-has-associated-label': 0,
		'max-len': 0,
		'newline-per-chained-call': 0,
		'no-confusing-arrow': 0,
		'no-console': 1,
		'no-nested-ternary': 0,
		'no-param-reassign': 0,
		'no-unused-vars': 1,
		'no-use-before-define': 0,
		'prefer-template': 2,
		'prefer-arrow-callback': 'error',
		'react-hooks/exhaustive-deps': 0, // Checks effect dependencies
		'react-hooks/rules-of-hooks': 'error',
		'react/destructuring-assignment': 0,
		'react/function-component-definition': [
			2,
			{
				namedComponents: 'arrow-function',
			},
		],
		'react/forbid-prop-types': 0,
		'react/jsx-closing-tag-location': 0,
		'react/jsx-filename-extension': 0,
		'react/jsx-first-prop-new-line': [2, 'multiline'],
		'react/jsx-no-target-blank': 0,
		'react/jsx-props-no-spreading': 0,
		'react/jsx-uses-vars': 2,
		'react/prop-types': 0,
		'react/require-default-props': 0,
		'react/require-extension': 0,
		'react/self-closing-comp': 0,
		'react/sort-comp': 0,
		'require-yield': 0,
		'simple-import-sort/imports': 'error',
		'sort-imports': 'off',
		'no-shadow': 0,
		'import/no-cycle': 1,
	},
};
