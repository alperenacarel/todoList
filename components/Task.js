import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert} from 'react-native';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';
import { useEffect } from 'react';
import { useState } from 'react';


const Task = ( props ) => {
    
    const taskId = props.id;
    const currentUid = props.currentUid;
    const friends = props.friends;

    const header = props.header;
    const information = props.information
    const participants = props.participants;
    const creator = props.creator; 
    const invitedUsers = props.invited;
    const subtasks = props.subtasks;

    const [imageUrls, setUrls] = useState([]);

    const getImages = () => {
        try{
            
            participants.forEach((element) => {
                firebase.firestore().collection('users').doc(element.id).get().then((doc) => {
                    const imgUrl = doc.data().imageUrl;

                    if(imageUrls.includes(imgUrl)){
                        null
                    }
                    else{
                        imageUrls.push(imgUrl);

                    }
                })
            })

            
        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    useEffect(() => {  
        getImages();
        
    }, [])

    return(
        <TouchableOpacity   style={[styles.item, props.addVisible ? {backgroundColor: 'rgba(0,0,0,0.01)', borderColor: 'rgba(0,0,0,0.01)'} 
                                    : '']} 
                            onPress={() => props.navigation.navigate('InTask', {taskId: taskId,
                                                                                header: header, 
                                                                                information: information,
                                                                                participants: participants,
                                                                                invitedUsers: invitedUsers,
                                                                                creator: creator,
                                                                                friends: friends,
                                                                                subtasks: subtasks}) }>
                                                                                
            
            <View style={styles.textSide}>
                
                <View style={styles.header}>
                    <Text style={styles.headText} >{header}</Text>
                </View>

                <View style={styles.information}>
                    <Text style={styles.infoText}>{information}</Text>
                </View>
            
            </View>

            <View style={styles.imageSide}>
            
                {imageUrls.slice(0,4).map((url, i) =>    {
                                                    if(i <= 2){
                                                        return(
                                                            <View key={i} style={[styles.imageCircle, props.addVisible ? {opacity: 0.2} : 1]}>
                                                                <Image  key={i} 
                                                                        source={{uri: url}} 
                                                                        style={styles.image}/>
                                                            </View>)
                                                    }
                                                    else if (i > 2 && participants.length > 3){
                                                        return(
                                                            <View key={i} style={styles.othersText}>
                                                                <Text key={i} style={{fontSize:12, fontWeight: '200'}}>
                                                                    +{participants.length - 3}
                                                                </Text>
                                                            </View>
                                                        )
                                                    }
                                                }
                                            )
                }

            </View>

        </TouchableOpacity>

    )

}

const styles = StyleSheet.create({
    item:{
        flex: 1,
        flexDirection: 'row',
        padding: 6, 
        borderRadius: 15,
        backgroundColor: '#E8D1D1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        height: 115,
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#F7DFDF',
    },

    textSide: { 
        flex: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems:'flex-start',
     
    },
    header:{
        flex: 0.6,
      
    },
    headText:{
        fontSize: 16,
        marginLeft: 6,
        marginTop: 3,
        color: 'black',
        fontWeight: '400',
    },

    information:{
        flex: 2,
        marginBottom: 4,
    },
    infoText:{
        fontSize: 14,
        marginLeft: 7,
        marginTop: 3,
        maxHeight: 50,
        fontWeight: '300',
    },

    imageSide:{
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        
    },   
    imageCircle:{
        width: 22,
        height: 22,
        borderRadius: 22,
        backgroundColor: '#E0CACA',
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    othersText:{
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image:{
        width: 22,
        height: 22,
        borderRadius: 22,
    },

    itemText:{
        maxWidth: 80,
        fontSize: 14,
        
    },
});

export default Task;