# Portfolio

[![Build](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml)
[![Build and Deploy](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/codeql-analysis.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/codeql-analysis.yml)

## Setup

- Install [nvm](https://github.com/nvm-sh/nvm)
- Run `nvm install` to set the node version mentioned in `.nvmrc`
- Run `corepack enable` to enable yarn shipped by node
- Run `yarn dev` to start development

## Deployment

- Copy `.env.example` to `.env` and specify port
- Spin up container using `docker-compose up -d`

### CLI Commands

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

# test the production build locally
yarn serve

# run tests with jest and enzyme
yarn test
```

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
