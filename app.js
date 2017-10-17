import 'styles/main.scss';
import aFrame from 'aframe';
import gamepad from 'aframe-gamepad-controls';


import snap from './components/snap';
import loader from './components/loader';
import world from './components/world';
import player from './components/player';

import cartoonish from './materials/cartoonish';


aFrame.registerComponent('snap', snap);
aFrame.registerComponent('world', world);
aFrame.registerComponent('player', player);
aFrame.registerComponent('voxel-loader', loader);
aFrame.registerComponent('gamepad-controls', gamepad);
aFrame.registerShader('cartoonish', cartoonish);
