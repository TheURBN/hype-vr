import 'styles/main.scss';
import aFrame from 'aframe';
import gamepad from 'aframe-gamepad-controls';


import snap from './components/snap';
import loader from './components/loader';

import cartoonish from './materials/cartoonish';


aFrame.registerComponent('snap', snap);
aFrame.registerComponent('voxel-loader', loader);
aFrame.registerComponent('gamepad-controls', gamepad);
aFrame.registerShader('cartoonish', cartoonish);
