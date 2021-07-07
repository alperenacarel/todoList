import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useEffect } from 'react';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';

const SearchCard = ( props ) => {

    const currentUid = props.currentUid;
    
    const itemId = props.itemId;
    const image = props.image;
    
    const [request, setRequest] = useState(null);
    var req = null;

    const sendRequest = async() => {
        try{
            await firebase.firestore().collection('users').doc(itemId).update({
                friendRequest : firebase.firestore.FieldValue.arrayUnion({  id: currentUid})
            }).then(() => {
                firebase.firestore().collection('users').doc(currentUid).update({
                    sendedRequest: firebase.firestore.FieldValue.arrayUnion({   id: itemId})
                })
            })

            setRequest(true);

        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    const removeRequest = async() => {
        try{
            await firebase.firestore().collection('users').doc(itemId).update({
                friendRequest : firebase.firestore.FieldValue.arrayRemove({ id: currentUid})
            }).then(() => {
                firebase.firestore().collection('users').doc(currentUid).update({
                    sendedRequest: firebase.firestore.FieldValue.arrayRemove({  id: itemId}) 
                })
            })

            setRequest(false);

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const checkRequest = async() => {
        try{
            await firebase.firestore().collection('users').doc(itemId).get().then((dataSnapshot) => {
                
                req = dataSnapshot.data().friendRequest;
                
                req.forEach((element) => {
                    if(currentUid === element.id) setRequest(true);
                    else setRequest(false);
                })
            })

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }

    }

    useEffect(() => {
        checkRequest();
        
    }, [])


    return (
        <View style={styles.container}>
            
            <View style={styles.imageHighligt} >
                <Image source={image && {uri: image}}  style={styles.image}/>
            </View>

            <View style={styles.text}>
                <Text style={styles.textStyle}>{props.username}</Text>
            </View>

            <View style={styles.button}>
                { request ?
                <TouchableOpacity style={styles.addButton} onPress={() => removeRequest()} >
                    <Ionicons name="close-outline" size={26} color="black" style={styles.addIcon}/>
                </TouchableOpacity>
                :
                <TouchableOpacity style={styles.addButton} onPress={() => sendRequest()} >
                    <Ionicons name="add" size={26} color="black" style={styles.addIcon}/>
                </TouchableOpacity>
                }
            
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding : 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
    },
    imageHighligt:{
        flex: 1,
        width: 32,
        height: 32,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image:{
        width: 36,
        height: 36,
        borderRadius: 32,
    },
    text:{
        flex: 8,
    },
    textStyle:{
        marginLeft: 15,
        fontWeight: '300',
    },
    button:{
        flex: 1,
    },
    addButton:{
        
    },
});

export default SearchCard;
