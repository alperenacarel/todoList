import React from 'react';
import { useEffect, useContext } from 'react';
import { useState } from 'react';
import {View, StyleSheet, Text, SafeAreaView, FlatList, Alert, RefreshControl, TouchableOpacity} from 'react-native';
import RequestCard from '../components/RequestCard.js';
import InviteCard from '../components/InviteCard.js';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import 'firebase/firebase-storage';
import firebase from 'firebase';
import 'firebase/firestore';
import { AuthContext } from '../stacks/AuthProvider';

const TopTab = createMaterialTopTabNavigator();

const NotificationScreen = ( {navigation} ) =>{

    const {user} = useContext(AuthContext);
    const currentUid = user.uid;
    
    const [requests, setRequests] = useState([]);
    const [invites, setInvites] = useState([]);

    const [refreshing, setRefreshing] = useState(false);
    const [refreshingInvite, setRefreshingInv] = useState(false);
    const [loading, setLoading] = useState(true);


    const getRequests = async() => {
        try{
            setRequests([]);
            await firebase.firestore().collection('users').doc(currentUid).get().then((doc) => {
                let reqs = doc.data().friendRequest;

                reqs.forEach(element => {
                    firebase.firestore().collection('users').doc(element.id).get().then((docs) => {
                        let ele = docs.data();

                        if(requests.findIndex(obj => obj.id === ele.id) > -1 ){
                            null
                        }else{
                            setRequests(arr => [...arr, ele]);
                        }

                    })
                });
            })

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const acceptRequest = async(item) => {
        const itemId = item.id;
        
        try{
            await firebase.firestore().collection('users').doc(currentUid).update({
                friends : firebase.firestore.FieldValue.arrayUnion({    id: itemId})
            }).then(() => {
                firebase.firestore().collection('users').doc(itemId).update({
                    friends : firebase.firestore.FieldValue.arrayUnion({    id: currentUid})
                })
            }).then(() => deleteRequest(item))

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const deleteRequest = async(item) => {
        const itemId = item.id;

        try{
            await firebase.firestore().collection('users').doc(currentUid).update({
                friendRequest : firebase.firestore.FieldValue.arrayRemove({ id: itemId,})
            }).then(() => {
                firebase.firestore().collection('users').doc(itemId).update({
                    sendedRequest : firebase.firestore.FieldValue.arrayRemove({ id: currentUid})
                })
            }).then(() => onRefresh())

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const getInvites = async() => {
        try{
            setInvites([]);
            await firebase.firestore().collection('users').doc(currentUid).get('taskInvites').then((dataSnapshot) => {
                setInvites(dataSnapshot.data().taskInvites);
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    const acceptInvite = async(item) => {
        try{
            let taskId = item.taskId;

            await firebase.firestore().collection('tasks').doc(taskId).update({
                participants: firebase.firestore.FieldValue.arrayUnion({id: currentUid})
            }).then(() => {
                firebase.firestore().collection('users').doc(currentUid).update({
                    tasks: firebase.firestore.FieldValue.arrayUnion({taskId: taskId})
                }).then(() => deleteInvite(item))
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    const deleteInvite = async(item) => {
        try{
            let taskId = item.taskId;
            //setInvites([]);

            await firebase.firestore().collection('tasks').doc(taskId).update({
                invited: firebase.firestore.FieldValue.arrayRemove({id: currentUid})
            }).then(() => {
                firebase.firestore().collection('users').doc(currentUid).update({
                    taskInvites: firebase.firestore.FieldValue.arrayRemove({header: item.header,
                                                                            invitedBy: item.invitedBy,
                                                                            taskId: taskId})
                }).then(() => onRefreshInvite())
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    function requestsScreen() {
        return(
        <View style={styles.notifications}>
                
            <FlatList   style={styles.wrapper}
                        keyExtractor={(item) => item.id}
                        data={requests}
                        renderItem={({ item }) => (
                        <View   style={styles.itemRow}>
                            <View   style={{flex: 0.6}}>
                                <RequestCard    key={item.id}
                                                username={item.username}
                                                itemId={item.id}
                                                image={item.imageUrl}
                                                currentUser={currentUid}/>
                            </View>
                            
                            <View style={{flex: 0.4, flexDirection: 'row', justifyContent: 'center'}}>
                                <TouchableOpacity style={styles.requestAccept} onPress={() => acceptRequest(item)}>
                                    <Text style={{fontWeight: '400', fontSize: 14}}>Add</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.requestReject} onPress={() => deleteRequest(item)}>
                                    <Ionicons name="md-close-outline" size={20} color="black" />
                                </TouchableOpacity>

                            </View>
                        
                        </View>      
                        )} 
                        refreshControl={
                            <RefreshControl refreshing={refreshingInvite}
                                            onRefresh={onRefresh}
                            />
                        }
            />
        
        </View>)
    }

    function invitesScreen() {
        return(
        <View style={styles.notifications}>
            <FlatList   style={styles.wrapper}
                        keyExtractor={(item) => item.taskId.toString()}
                        data={invites}
                        renderItem={({ item }) => {
                            return(
                                <View style={styles.inviteRow}>
                                    <View style={{flex: 0.55}}>    
                                        <InviteCard invitedBy={item.invitedBy}
                                                    header={item.header}/>
                                    </View>

                                    <View style={{flex: 0.45, flexDirection: 'row', justifyContent: 'center'}}>
                                        <TouchableOpacity style={styles.inviteAccept} onPress={() => acceptInvite(item)}>
                                            <Text style={{fontWeight: '400', fontSize: 14}}>Join</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.inviteReject} onPress={() => deleteInvite(item)}>
                                            <Ionicons name="md-close-outline" size={20} color="#B3B5C7" />
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            )
                        }} 
                        refreshControl={
                            <RefreshControl refreshing={refreshing}
                                            onRefresh={onRefreshInvite}
                            />
                        }
            />
        </View>)
    }

    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
      }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        getRequests();
        
        wait(1000).then(() => setRefreshing(false));
    }, []);

    const onRefreshInvite = React.useCallback(() => {
        setRefreshingInv(true);
        getInvites();
        
        wait(1000).then(() => setRefreshingInv(false));
    }, []);

    useEffect(() => {
        getRequests();
        getInvites();
        
        console.log(requests);
    }, [])

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.head}>
                <Text style={styles.headText}>Notifications</Text>
            </View>
            
            <TopTab.Navigator   tabBarOptions={{
                                    indicatorStyle: {backgroundColor: '#E8D1D1'},
                                    labelStyle: { fontSize: 12, fontWeight:'200' },
                                    style: { backgroundColor: 'white' },
                                }}>
                {<TopTab.Screen name='User Requests' component={requestsScreen}/>}
                <TopTab.Screen name='Task Invites' component={invitesScreen}/>
            </TopTab.Navigator>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
    },
    head:{
        flex: 0.11,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headText:{
        fontSize: 22,
        color: '#000000',
        fontWeight: '200',
        marginLeft: 25,
    },
    topBar:{
        flex: 0.3,
        flexDirection: 'row'
    },
    notifications:{
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    wrapper:{
        flex: 1,
        width: 320,
    },
    itemRow:{
        flex: 1,
        justifyContent: 'flex-start',
        padding : 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
    },
    requestAccept: {
        width: 60,
        height: 25,
        backgroundColor: '#B3B5C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        borderRadius: 5,
    },
    requestReject: {
        width: 45,
        height: 25,
        borderWidth: 0.8,
        borderColor: '#B3B5C7',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    inviteRow:{
        flex: 1,
        justifyContent: 'center',
        padding : 2,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
    },
    inviteAccept:{
        width: 60,
        height: 25,
        backgroundColor: '#B3B5C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        borderRadius: 5,
    },
    inviteReject:{
        width: 45,
        height: 25,
        borderWidth: 0.8,
        borderColor: '#B3B5C7',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    

})

export default NotificationScreen;