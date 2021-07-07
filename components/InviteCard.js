import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';
import { useState } from 'react';
import { useEffect } from 'react';

const InviteCard = ( props ) => {

    const [inviterName, setName] = useState();    
    const [inviterImage, setImage] = useState(null);
    
    const getInviter = async() => {
        try{
            await firebase.firestore().collection('users').doc(props.invitedBy).get().then((doc) => {
                setName(doc.data().username);
                setImage(doc.data().imageUrl);
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    useEffect(() => {
        getInviter();
    }, [])
    
    return (
        <View style={styles.container}>
            <View   style={styles.imageSide}>
                {inviterImage === null ? <ActivityIndicator size="small"/> : <Image source={{uri: inviterImage}}  
                                                                                    style={styles.image}/>}
            </View>

            <View   style={styles.textSide}>
                <Text style={{fontWeight: '300', fontSize: 13, marginLeft: 5}}>
                    <Text style={{fontWeight: '500'}}>{inviterName}</Text> 
                        <Text> invited you to </Text>
                            <Text style={{fontWeight: '500'}}>{props.header}</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        flexDirection: 'row',
        marginTop: 5,
    },
    imageSide:{
        flex: 0.15,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    image:{
        width: 42,
        height: 42,
        borderRadius: 36,
    },
    textSide:{
        flex: 0.9,
        marginLeft: 15,
    },
});

export default InviteCard;
