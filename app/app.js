import 'styles/main.scss';
import aFrame from 'aframe';
import gamepad from 'aframe-gamepad-controls';


import loader from './components/loader';
import world from './components/world';
import player from './components/player';
import customEvents from './components/customEvents';

import worldPlane from './materials/worldPlane';


aFrame.registerComponent('world', world);
aFrame.registerComponent('player', player);
aFrame.registerComponent('voxel-loader', loader);
aFrame.registerComponent('gamepad-controls', gamepad);
aFrame.registerComponent('custom-events', customEvents);
aFrame.registerShader('world-plane', worldPlane);
