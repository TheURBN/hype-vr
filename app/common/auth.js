import firebase from 'firebase';


const config = {
  apiKey: 'AIzaSyB27VzuEEpVN1dCjPcvDMAF9BB-Fi5yUGw',
  authDomain: 'theurbngame.firebaseapp.com',
  databaseURL: 'https://theurbngame.firebaseio.com',
  projectId: 'theurbngame',
  storageBucket: 'theurbngame.appspot.com',
  messagingSenderId: '942689880769',
};

export default firebase.initializeApp(config);
