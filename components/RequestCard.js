import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

const RequestCard = ( props ) => {

    const image = props.image;

    return (
        <View style={styles.container}>
            
            <View style={styles.imageHighligt} >
                {image === null ? <ActivityIndicator size="small"/> : <Image source={{uri: image}}  style={styles.image}/>}
            </View>

            <View style={styles.text}>
                <Text style={styles.textStyle}> 
                    <Text style={{fontWeight: '500'}}>{props.username}</Text> 
                        <Text> wants to be friend</Text>
                </Text>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
    },
    imageHighligt:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image:{
        width: 42,
        height: 42,
        borderRadius: 42,
    },
    text:{
        flex: 3,
        marginLeft: 5,
    },
    textStyle:{
        fontWeight: '300',
        fontSize: 14,
        marginLeft: 5,
    },
});

export default RequestCard;
