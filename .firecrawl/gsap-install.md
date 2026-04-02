[Skip to main content](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false#__docusaurus_skipToContent_fallback)

On this page

Detailed walkthrough

GSAP Installation - YouTube

Tap to unmute

[GSAP Installation](https://www.youtube.com/watch?v=68OmI6POaMo) [GSAP Learning](https://www.youtube.com/channel/UCFPckx3BFK_GvJag82CjDlg)

GSAP Learning46.6K subscribers

GSAP is "framework agnostic", this means it can be used in React, Webflow, Wordpress, or any other JS/Web frameworks. The core GSAP file and all the plugins are just **Javascript files**.

This video and the install helper below both cover the most common ways to load the files. Namely via [NPM](https://www.npmjs.com/), [Yarn](https://yarnpkg.com/), and using a simple `<script>` tag. Pick your own adventure or check out our install guides in the left submenu for framework or tool specific guidance.

## Grab the files [​](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false\#grab-the-files "Direct link to Grab the files")

[GetGSAP](https://gsap.com/community/files/file/20-gsap-public-files/?do=download&csrfKey=5246c078764715c622dad9e06316d364)

What's in the zip download?

The zip file contains the following directories:

- **/minified/** \- This is likely what you need. Load into a web page in a script tag, universally compatible and highly compressed for maximum load speed.
- **/UMD/** \- uncompressed versions of the minified files, in UMD format (highly compatible). Typically these are used for older build tools or for debugging (because the source code is human-readable)
- **/ESM** \- ES Module files, transpiled down to be compatible with modern build tools (no fancy ES6 stuff)
- **/src/**\- the raw source code files which are modern ES6 modules

Legacy Note - Private Repository

The private NPM repository is no longer maintained as GSAP and all the plugins are now freely available on [npm.](https://www.npmjs.com/package/gsap) If your project references `npm.greensock.com` in an `.npmrc` file, update your configuration to install directly from npm. Ensure that you are using GSAP **version 3.13** or later.

[View the migration guide](https://gsap.com/resources/private-repo-migration) for more detailed instructions

## Install Helper [​](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false\#install-helper "Direct link to Install Helper")

- npm
- cdn
- yarn

```bash
npm install gsap
```

## Import and Include Plugins

Uncheck All

##### Plugins

- Draggable

- DrawSVG

- Easel

- Flip

- GSDevTools

- Inertia

- MotionPathHelper

- MotionPath

- MorphSVG

- Observer

- Physics2D

- PhysicsProps

- Pixi

- ScrambleText

- ScrollTrigger

- ScrollSmoother

- ScrollTo

- SplitText

- Text


##### Eases

- RoughEase

- ExpoScaleEase

- SlowMo

- CustomEase

- CustomBounce

- CustomWiggle


##### React

- useGSAP


- umd
- esm

```js
import { gsap } from "gsap";
```

### FAQs [​](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false\#faqs "Direct link to FAQs")

#### Do I need to gsap.registerPlugin() each plugin?

Typically, yes. If you're loading GSAP via a `<script>` tag (i.e. not a build tool) GSAP will attempt to auto-register the plugins as long as the core has already loaded, but we still recommend registering plugins so that build tools don't drop them during tree shaking. You can register all your plugins at once, like

```js
gsap.registerPlugin(MotionPathPlugin, ScrollToPlugin, TextPlugin);
```

#### Is it bad to register a plugin multiple times?

No, it's perfectly fine. It doesn't help anything, nor does it hurt.

If you are using a modules environment and want to avoid registering a plugin multiple times you can import GSAP and all the plugins you need in a gsap.js file and then import what you need from that file in other modules. For example, using the GSAP core and DrawSVG gsap.js could be:

```js
export * from "gsap";
export * from "gsap/DrawSVGPlugin";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin);
```

Then in another file:

```js
import { gsap, DrawSVGPlugin } from "../gsap.js"
```

#### I'm getting a TypeScript error - what do I do?

First, make sure you're using the official TypeScript definitions that are found in the main [GitHub repo](https://github.com/greensock/GSAP/tree/master/types). If you continue running into issues, feel free to post in [our forums](https://gsap.com/community/) or create a new issue on the [GSAP GitHub repo](https://github.com/greensock/GSAP/). If you need to tell your compiler where the definitions are, you can do something like this:

```js
{
  "compilerOptions": {
    ...
  },
  "files": [\
    "node_modules/gsap/types/index.d.ts"\
  ]
}
```

#### How can I load the non-ES modules version of GSAP using a build tool?

Some build tools may not understand ES modules, so you can use the UMD (universal module definition) format instead. To do that, simply click "NPM" and then "UMD" in the install helper above and copy the code generated. For example: `import { gsap } from "gsap/dist/gsap";` (notice the files are all in the `/dist/` subdirectory)

#### Why does my production build fail? (perhaps in webpack, vue-cli or create-react-app)

Modern build tools often use a process called tree shaking to remove unused code. Sometimes they are over-aggressive and drop plugins due to the fact that you didn't reference them anywhere in your own code. To prevent this, you must explicitly register the plugin(s) using [gsap.registerPlugin](https://gsap.com/docs/v3/GSAP/gsap.registerPlugin())

```js
gsap.registerPlugin(MotionPathPlugin, ScrollToPlugin, TextPlugin);
```

#### Can I use an older version of GSAP?

Sure! You can view and download older versions of GSAP by going to the GitHub [releases page](https://github.com/greensock/GSAP/releases). We recommend using the latest version though.

## Contents

- [Grab the files](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false#grab-the-files)
- [Install Helper](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false#install-helper)
  - [FAQs](https://gsap.com/docs/v3/Installation/?tab=npm&module=esm&require=false#faqs)