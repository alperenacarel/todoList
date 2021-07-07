import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';

const width = Dimensions.get('window').width;


const AddParti = ( props ) => {

    const image = props.image;
    const username = props.username;
    const [loading, setLoading] = useState(false);


    return (
        <View style={styles.container} >
            
            <View style={styles.imageHighligt} >
                { loading ? <ActivityIndicator size="small" style={styles.loading}/> 
                : null
                }
                <Image  source={{uri: image}}  
                        style={styles.image}   
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}/>
            </View>

            <View style={styles.text}>
                <Text style={styles.textStyle}>{username}</Text>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding : 5,
        alignItems: 'center',
        flexDirection: 'row',
    },
    imageHighligt:{
        flex: 1,
        width: 36,
        height: 36,
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
        marginLeft: 20,
        fontSize: 16,
        fontWeight: '200',
    },
    checkBox:{
        flex: 0.5,
        width: 24,
        height: 16,
        justifyContent: 'center',
    },
    loading:{
        marginTop: 30,
    },
});

export default AddParti;
