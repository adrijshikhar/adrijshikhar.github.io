import { gsap } from "gsap";

import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/Observer";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { CustomWiggle } from "gsap/CustomWiggle";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(
  Flip,
  ScrollTrigger,
  ScrollToPlugin,
  Observer,
  TextPlugin,
  SplitText,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  MotionPathPlugin,
  ScrambleTextPlugin,
  Draggable,
);

export {
  gsap,
  Flip,
  ScrollTrigger,
  ScrollToPlugin,
  Observer,
  TextPlugin,
  SplitText,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  MotionPathPlugin,
  ScrambleTextPlugin,
  Draggable,
};
