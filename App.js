import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

import * as firebase from 'firebase';
import Providers from './stacks';


var firebaseConfig = {
  apiKey: "AIzaSyCPJWf9c_Bs9d4ShIGS-_c-qgRSwPPAcgo",
  authDomain: "todolist-d45a9.firebaseapp.com",
  projectId: "todolist-d45a9",
  storageBucket: "todolist-d45a9.appspot.com",
  messagingSenderId: "133551991146",
  appId: "1:133551991146:web:b2a743778204626cdc5d13"
  };

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}


export default function App(){
  
  return (

    <Providers /> 
    
    );
}

AppRegistry.registerComponent(appName, () => App)
