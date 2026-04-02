[Skip to main content](https://gsap.com/docs/v3/Eases/#__docusaurus_skipToContent_fallback)

Plugin Eases

["slow"](https://gsap.com/docs/v3/Eases/SlowMo), ["rough"](https://gsap.com/docs/v3/Eases/RoughEase), and ["expoScale"](https://gsap.com/docs/v3/Eases/ExpoScaleEase) eases are not in the core - they are packaged together in an **EasePack** file in order to minimize file size. ["CustomEase"](https://gsap.com/docs/v3/Eases/CustomEase), ["CustomBounce"](https://gsap.com/docs/v3/Eases/CustomBounce), and ["CustomWiggle"](https://gsap.com/docs/v3/Eases/CustomWiggle) are packaged independently as well (not in the core).

See the [installation page](https://gsap.com/docs/v3/Installation) for details.

**Easing is the primary way to change the timing of your tweens.** Simply changing the ease can adjust the entire feel and personality of your animation. There are infinite eases that you can use in GSAP so we created the visualizer below to help you choose exactly the type of easing that you need.

## Ease Visualizer

value: -75

progress: 0.08

power0

power1

power2

power3

power4

Preview

View: graphclockboxgraph

Show editing hints

- Add point: ALT-CLICK on line
- Toggle smooth/corner: ALT-CLICK anchor
- Get handle from corner anchor: ALT-DRAG
- Toggle select: SHIFT-CLICK anchor
- Delete anchor: press DELETE key
- Undo: CTRL-Z

#### [Core](https://gsap.com/core/)

none

power1

ininOutoutout

power2

power3

power4

back

bounce

circ

elastic

expo

sine

steps

#### Ease pack

rough

slow

expoScale

#### [Extra Eases](https://gsap.com/pricing/)

CustomEase

CustomBounce

CustomWiggle

Share Ease

// click to modify the underlined values

gsap.to(target, {

duration:0.512.55102.5,

ease: "backbouncecircelasticexpononequad/power1Cubic/power2quart/power3strong/Quint/power4sineroughslowstepsexpoScaleCustomCustomBounceCustomWigglepower1.ininOutoutout",none({
template:backbouncecircelasticexponone/linearquad/power1Cubic/power2quart/power3strong/Quint/power4sinenone.ininOutoutoutnone,

strength: 0.20.511.521,

points:10205010020020,

taper:noneinoutbothnone,

randomize:true,

clamp:false

})",
(0.10.30.50.70.90.7,0.10.40.7120.7,false)",(scale from 1 to 2scale from 0.5 to 7scale from 10 to 2>0.5,7,nonepower1.inpower1.outpower1.inOutpower2.inpower2.outpower2.inOut>none)",(2612204012)",(11.21.51.7521,0.10.20.30.40.50.7510.3)",(11.41.72341.7)",create("custom", "0.104,0.204,0.492,1"),create("myWiggle", {
wiggles:1510152010,

type:easeOuteaseInOutanticipateuniformrandomeaseInOut

}),
create("myBounce", {
strength:0.10.50.70.910.7,

endAtStart:truefalsefalse,

squash:12341,

squashID: "myBounce-squash"

}),

y: -500

rotation: 360

x: "400%"

});

none (linear)

nonenonenone

power1

outinOutin

power2

outinOutin

power3

outinOutin

power4

outinOutin

back

outinOutin

elastic

outinOutin

bounce

outinOutin

Other

roughslowsteps

circ

outinOutin

expo

outinOutin

sine

outinOutin

Coding tip - Default Easing

GSAP uses a default ease of `"power1.out"`. You can overwrite this in any tween by setting the `ease` property of that tween to another (valid) ease value. You can set a different default ease for GSAP by using [gsap.defaults()](https://gsap.com/docs/v3/GSAP/gsap.defaults()). You can also set defaults for particular [timelines](https://gsap.com/docs/v3/GSAP/Timeline).

```js
gsap.defaults({
  ease: "power2.in",
  duration: 1,
});

gsap.timeline({defaults: {ease: "power2.in"}})
```

## How to use the Ease Visualizer [​](https://gsap.com/docs/v3/Eases/\#how-to-use-the-ease-visualizer "Direct link to How to use the Ease Visualizer")

To use the ease visualizer, simply click on the ease name that you'd like to use. You can also click on the underlined text to change the values and type of ease.

Use the navigation links in the menu to the left for more information about complex eases.

Video Walkthrough

GSAP Ease Visualizer - YouTube

Tap to unmute

[GSAP Ease Visualizer](https://www.youtube.com/watch?v=jfKf7EtMbxI) [snorklTV](https://www.youtube.com/channel/UCbgqcgmk-T8VVjzPVy0001Q)

snorklTV12.7K subscribers

[Watch on](https://www.youtube.com/watch?v=jfKf7EtMbxI)

Huge thanks to Carl for providing this video. We highly recommend their extensive GSAP training at [CreativeCodingClub.com](https://www.creativecodingclub.com/bundles/creative-coding-club?ref=44f484). Enroll today in their [Free GSAP course](https://www.creativecodingclub.com/courses/FreeGSAP3Express?ref=44f484) and discover the joy of animating with code.