import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';

const FriendCard = ( props ) => {

    const image = props.image;
    const [loading, setLoading] = useState(false);

    return (
        <View style={[styles.container, props.modalVisible || props.addVisible 
                                        ?   {borderColor: 'rgba(0,0,0,0.1)',
                                            backgroundColor: 'rgba(0,0,0,0.001)'
                                            }
                                        : '']}>
            <View style={styles.imageHighligt} >
                { loading ? <ActivityIndicator size="small" style={styles.loading}/> 
                : null
                }
                <Image  source={{uri: image}}
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}
                        style={[styles.image, props.modalVisible || props.addVisible ? {opacity: 0.05} : 1]}/>
            </View>

            <View style={styles.text}>
                <Text style={[styles.textStyle, props.modalVisible || props.addVisible ? {opacity: 0.3} : 1]}>
                    {props.username}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        height: 60,
        borderRadius: 12,
        borderWidth: 1.2,
        marginTop: 5,
        borderColor: '#F1F1F1',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    imageHighligt:{
        flex: 0.25,
        width: 48,
        height: 48,
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image:{
        width: 48,
        height: 48,
        borderRadius: 42,
    },
    text:{
        flex: 0.75,
        marginLeft: 10,
    },
    textStyle:{
        fontSize: 16,
        fontWeight: '200',
    },
    loading:{
        marginTop: 40,
    },
});

export default FriendCard;
