import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, Image, TouchableOpacity, StatusBar, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useContext, useState } from 'react';
import { AuthContext } from '../stacks/AuthProvider';
import { EvilIcons } from '@expo/vector-icons';

const {width} = Dimensions.get('screen')

const LoginScreen = ( { navigation } ) => {

    const [email, setEmail]  = useState()
    const [password, setPassword] = useState()

    const {login} = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E8D1D1" />
            <View style={styles.logoSide}>
                <View style={styles.logo}>
                    <Image source={require('../assets/logo2.png')} />
                </View>
            </View>

            <View style={styles.inputSide}>
                <View style={styles.inputs}>
                    <EvilIcons name="envelope" size={24} color="black" /> 

                    <TextInput 
                        style={styles.inputBox}
                        value={email}
                        onChangeText={email => setEmail(email)}
                        placeholder='Email'
                        clearButtonMode = 'while-editing'
                        autoCapitalize='none'
                        placeholderTextColor='#545C36'
                    />
                </View>

                <View style={styles.inputs}>
                    <EvilIcons name="lock" size={24} color="black" />

                    <TextInput 
                        style={styles.inputBox}
                        value={password}
                        onChangeText={password => setPassword(password)}
                        secureTextEntry
                        autoCapitalize='none'
                        clearButtonMode = 'while-editing'
                        placeholder='Password'
                        placeholderTextColor= '#545C36'
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={() => login(email, password)} >
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.register} 
                                onPress={() => navigation.navigate('Register') }>
                    
                    <Text style={styles.registerText}>Sign Up Here</Text>
                    
                </TouchableOpacity>
            
            </View>

            <View style={styles.designExtra}>
                <View style={styles.designBox1}></View>
                <View style={styles.designBox2}></View>
                <View style={styles.designBox3}></View>
            </View>

           
        
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
        flexDirection: 'column',
    },
    logoSide:{
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    logo:{
        width: 128,
        height: 128,
        borderRadius: 30,
    },
    inputSide:{
        flex: 2,
        borderStartColor: 'black',
        alignItems: 'center',
        justifyContent: 'flex-end',
        //marginTop: 20,
    },
    inputs:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        padding: 10,
        fontSize: 12,
        borderRadius: 10,
        width: 260,
        height: 45,
        backgroundColor:'white',
        borderWidth: 1,
        borderColor: '#808080',
        marginLeft: 5,
        elevation: 3,
        marginRight: 20,
        marginBottom: 8,
        
    },
    icons:{
        //marginLeft: width/10,
    },
    loginButton:{
        width: 110 ,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#B3B5C7',
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    loginText:{
        fontSize: 16,
        color: 'black',
        fontWeight: '300',
    },
    register:{
        marginTop: 20,
        borderBottomWidth: 0.25,
        
    },
    registerText:{
        color: 'black',
        fontWeight: '300',
    },
    designExtra:{
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    designBox1:{
        width: width/3 ,
        height: 20,
        backgroundColor: '#C7B3B3',
        borderRadius: 20,
        marginTop:5,
        elevation: 4,
    },
    designBox2:{
        width: width/2 ,
        height: 22.5,
        backgroundColor: '#B3C7B8',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        marginTop:10,
        elevation: 3,
    },
    designBox3:{
        width: width/1.5 ,
        height: 25,
        backgroundColor: '#B3B5C7',
        borderRadius: 25,
        marginTop:10,
        elevation: 2,
    },
    
});

export default LoginScreen;
