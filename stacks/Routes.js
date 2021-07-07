import { NavigationContainer } from '@react-navigation/native';
import React, {useContext, useState, useEffect} from 'react';
import { AuthContext } from './AuthProvider';
//import auth from '@react-native-firebase/auth';
import * as firebase from 'firebase';

import AuthStack from './AuthStack';
import TaskStack from './TaskStack';
import Tabs from '../components/Tabs';


const Routes = () => {
    
    const {user, setUser} = useContext(AuthContext);
    const {initializing, setInitializing} = useState(true);

    const onAuthStateChanged = (user) => {
        setUser(user);
        if(initializing) setInitializing(false);
    };

    useEffect(() => {
        const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, []);

    if(initializing) return null;

    return(
        <NavigationContainer>
            {user ? <Tabs /> : <AuthStack />}
        </NavigationContainer>
    );

};

export default Routes;