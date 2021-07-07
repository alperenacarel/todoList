import React, { Component, useEffect } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Image, StatusBar, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';

import * as firebase from 'firebase';
import 'firebase/firebase-storage';
import 'firebase/firestore';

import { AuthContext } from '../stacks/AuthProvider';
import * as ImagePicker from 'expo-image-picker'

const RegisterScreen = ( { navigation } ) => {

    const [username, setUsername] = useState();
    const [email, setEmail]  = useState();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

    const [usernameExist, setExist] = useState();

    useEffect(() => {
        (async () => {
            const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
            setHasGalleryPermission(galleryStatus.status === 'granted');
        })();
      }, []);
      
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          console.log(result);

          if (!result.cancelled){
              setImage(result.uri);
              console.log(result.uri);
          }
    };

    const checkUsername = (text) => {
        try{
            let exi = firebase.firestore().collection('users').where('username', '==', text).get()

            console.log(exi.length);
        

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const checkInformations = () => {
        if(password != confirmPassword){
            Alert.alert("Passwords not equal")
        }
        else{
            register(email, password, username, image);
        }
    }

    const {register} = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.container}>

            <SafeAreaView style={styles.back}>
                
                <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.goBack())}  
                                  style={styles.goBack}>
                    
                    <MaterialIcons name="arrow-back-ios" size={22} color="black" />
                
                </TouchableOpacity>
            
            </SafeAreaView>

            <SafeAreaView style={styles.main}>

                <TouchableOpacity  style={styles.imageBox}
                                   onPress={pickImage}>
                                       
                    { image != null ? <Image source={{uri: image}} style={styles.userImage} /> : <Text style={{fontWeight: '200'}}>Upload Photo</Text> }

                </TouchableOpacity>
                
                <View style={styles.inputs}>    

                    <EvilIcons name="user" size={24} color="black" /> 
                    
                    <TextInput 
                        style={styles.inputBox}
                        placeholder='Username'
                        placeholderTextColor= '#545C36'
                        clearButtonMode = 'while-editing'
                        autoCapitalize='none'
                        value={username}
                        onChangeText={username => setUsername(username)}
                    />
                </View>

                <View style={styles.inputs}>    

                    <EvilIcons name="envelope" size={24} color="black" />  
                    
                    <TextInput 
                        style={styles.inputBox}
                        placeholder='Email'
                        placeholderTextColor= '#545C36'
                        clearButtonMode = 'while-editing'
                        autoCapitalize='none'
                        value={email}
                        onChangeText={email => setEmail(email)}
                    />
                </View>
                
                <View style={styles.inputs}>
                    <EvilIcons name="lock" size={24} color="black" />

                    <TextInput 
                        style={styles.inputBox}
                        placeholder='Password'
                        placeholderTextColor= '#545C36'
                        clearButtonMode = 'while-editing'
                        autoCapitalize='none'
                        value={password}
                        onChangeText={password => setPassword(password)}
                        secureTextEntry
                    />
                </View>
                
                <View style={styles.inputs}>
                    <EvilIcons name="lock" size={24} color="black" />

                    <TextInput 
                        style={[styles.inputBox, confirmPassword != '' && password != confirmPassword ? {borderColor: '#D1705A'} : '']}
                        placeholder='Confirm Password'
                        placeholderTextColor= '#545C36'
                        clearButtonMode = 'while-editing'
                        autoCapitalize='none'
                        value={confirmPassword}
                        onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
                        secureTextEntry
                    />
                </View>

                
                <TouchableOpacity   style={styles.registerButton} 
                                    //onPress={() => register(email, password, username, image)}
                                    onPress={() => checkInformations(username)}
                                    >
                    <Text style={{fontWeight: '300', fontSize: 16}}>Register</Text>
                </TouchableOpacity>

            </SafeAreaView>
        
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    back:{
        flex:1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    imageBox:{
        height: 128,
        width: 128,
        borderWidth: 1,
        marginBottom: 30,
        marginLeft: 5,
        borderRadius: 64,  
        borderColor: '#808080',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userImage:{
        width: 128,
        height: 128,
        borderRadius: 64,
    },
    main:{
        flex: 7,
        flexDirection: 'column',
        justifyContent:'flex-start',
        alignItems:'center',
        marginBottom: 50,
    },
    inputs:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputBox: {
        padding: 10,
        fontSize: 12,
        borderRadius: 10,
        width: 280,
        height: 45,
        backgroundColor:'white',
        borderWidth: 1,
        borderColor: '#808080',
        marginLeft: 5,
        marginBottom: 10,
        elevation: 3,
    },
    registerButton:{
        width: 110 ,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#B3B5C7',
        marginTop: 20,
        marginLeft: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    goBack:{
        width: 30,
        height: 30,
        marginLeft: 30,
        marginTop: 15,
        justifyContent: 'center',

    },

});

export default RegisterScreen;
