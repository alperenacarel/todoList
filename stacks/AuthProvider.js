import React, {createContext, useState} from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/firebase-storage';
import {Alert} from 'react-native';

export const AuthContext = createContext();

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

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    uploadImage = async(uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        var ref = firebase.storage().ref().child(firebase.auth().currentUser.uid);
        
        return ref.put(blob);
    }

    const setUrl = async() => {
        let ref = firebase.auth().currentUser.uid;
        
        try{
            await firebase.storage().ref(ref).getDownloadURL().then((url) => {
                firebase.firestore().collection('users').doc(ref).update({
                    imageUrl: url
                })
            })
        }catch(e){
            Alert.alert("Something went wrong")
        }
    }


    return(
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: async(email, password) => {
                    try{
                        await firebase.auth().signInWithEmailAndPassword(email, password);
                    }catch(e){
                        console.log(e);
                        Alert.alert('Something went wrong', e.message)
                    }
                },

                register: async(email, password, username, image) => {
                    try{
                        await firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then((result) => {
                            firebase.firestore().collection("users")
                            .doc(firebase.auth().currentUser.uid)
                            .set({  username: username,
                                    email: email,
                                    id: firebase.auth().currentUser.uid,
                                    sendedRequest: [],
                                    friendRequest: [],
                                    friends: [],
                                    taskInvites: [],
                                    tasks: [],
                                    imageUrl: null,
                                });
                        }).then(() => uploadImage(image)).then(() => setUrl())
                    }catch(e){
                        console.log(e);
                        Alert.alert('Something went wrong', e.message)
                    }

                },

                logout: async() => {
                    try{
                        await firebase.auth().signOut();
                    }catch(e){
                        console.log(e);
                        Alert.alert('Something went wrong', e.message);
                    }
                },
            }}>
            {children}
        </AuthContext.Provider>
    );
}