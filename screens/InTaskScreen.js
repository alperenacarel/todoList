import React, { Component, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, SectionList, Dimensions, Image, Modal, Alert, 
        ActivityIndicator, TextInput} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, TouchableHighlight } from 'react-native-gesture-handler';
import { AuthContext } from '../stacks/AuthProvider';

import 'firebase/firebase-storage';
import 'firebase/firestore';
import firebase from 'firebase';

const width = Dimensions.get('screen').width;

const InTaskScreen = ( {route, navigation} ) => {

    const {user} = useContext(AuthContext);
    const {taskId, header, information, participants, creator, friends, invitedUsers} = route.params;

    const [inviteLoading, setInviteLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const [subtasks, setSubtasks] = useState([]);
    const [participantsArr, setParticipants] = useState([]);
    const [inviteList, setInviteList] = useState([]);

    const [userTasks, setUserTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);

    const [usersModal, setUsersModal] = useState(false);
    const [inviteModal, setInviteModal] = useState(false);
    const [subtaskModal, setSubtaskModal] = useState(false);

    const [subtaskName, setSubtaskName] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const DATA = [
        {
            title: "Your Tasks",
            data: userTasks 
        },
        {
            title: "Other Users Tasks",
            data: otherTasks,
        },
        {
            title: "Done",
            data: doneTasks,
        },
    ]

    const getSubstasks = async() => {
        try{
            var empty = [];
                
            setUserTasks(empty);
            setOtherTasks(empty);
            setDoneTasks(empty);

            await firebase.firestore().collection('tasks').doc(taskId).get().then((doc) => {
                var subs = doc.data().subtasks;

                for(let i = 0; i < subs.length; i++){
                    var sub = subs[i];
                    console.log(sub);
                    var assignedTo = subs[i].assignedTo;
                    var done = subs[i].done;

                    if( assignedTo === user.uid && !done ){
                        setUserTasks(arr => [...arr, sub])
                    }
                    else if( assignedTo != user.uid && !done ){
                        setOtherTasks(arr => [...arr, sub])
                    }
                    else if( done ){
                        setDoneTasks(arr => [...arr, sub])
                    }
                }
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const doneAlert = (item) => {
        Alert.alert(
            "Set Done",
            "Are you sure you want to mark as done?",
            [
                {
                    text: "Yes",
                    onPress: () => setAsDone(item),
                    style: "cancel"
                },
                {
                    text:"Cancel",
                    style: "cancel"
                },
            ]
        )
    }

    const setAsDone = async(item) => {
        try{
            console.log(item);

            await firebase.firestore().collection('tasks').doc(taskId).update({
                subtasks: firebase.firestore.FieldValue.arrayRemove(item)
            }).then(() => {
                firebase.firestore().collection('tasks').doc(taskId).update({
                    subtasks: firebase.firestore.FieldValue.arrayUnion({id: item.id,
                                                                        assignedTo: item.assignedTo,
                                                                        assignedBy: item.assignedBy,
                                                                        title: item.title,
                                                                        done: true})
                }).then(() => getSubstasks())
            })
        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const createSubtask = async() => {
        
        var subId = taskIdGenerator();

        try{
            if(selectedUser && subtaskName != null)
            {
                var doc = { id: subId,
                            title: subtaskName,
                            assignedBy: user.uid,
                            assignedTo: selectedUser,
                            done: false}

                await firebase.firestore().collection('tasks').doc(taskId).update({
                    subtasks: firebase.firestore.FieldValue.arrayUnion(doc)
                })

                getSubstasks();

                setSubtaskModal(false);

            }else{
                Alert.alert("Please fill all fields")
            }

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    function taskIdGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
        };

        return (S4() + S4() + S4() + "-" + S4());
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            
            getSubstasks();
            console.log(userTasks);
        });
    
        return unsubscribe;

    }, [navigation]);

    const getParticipants = () => {
        try{
            let parts = participants;

            parts.forEach(element => {
                firebase.firestore().collection('users').doc(element.id).get().then((doc) => {
                    let ele = {...doc.data(), checked: false};

                    if(participantsArr.findIndex(obj => obj.id === ele.id) > -1){
                        null
                    }else{
                        setParticipants(arr => [...arr, ele]);
                    }

                })
            });
        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const leaveAlert = () => {
        Alert.alert(
            "Leave",
            "Do you want to leave from task?",
            [
                {
                    text: "Yes",
                    onPress: () => leave(),
                    style: "cancel"
                },
                {
                    text:"Cancel",
                    style: "cancel"
                },
            ]
        )
    }

    const leave = async() => {
        try{
            await firebase.firestore().collection('tasks').doc(taskId).update({
                participants: firebase.firestore.FieldValue.arrayRemove({id: user.uid})
            }).then(() => {
                firebase.firestore().collection('users').doc(user.uid).update({
                    tasks: firebase.firestore.FieldValue.arrayRemove({taskId: taskId})
                })
            })

            setUsersModal(false);

            navigation.goBack();

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const getInviteList = async() => {
        setInviteList([]);
        setInviteLoading(true)
        
        try{
            friends.forEach(element => {
                firebase.firestore().collection('users').doc(element.id).get().then(doc => {
                    let ele = {...doc.data(), checked: false}

                    if(participants.findIndex(obj => obj.id === ele.id) > -1 )
                    {
                        null
                    }else{
                        setInviteList(arr => [...arr, ele]);
                    }
                })
            })

            setInviteLoading(false);

        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    const setSelection = (item) => {
        const newArr = [...inviteList];
        var index = newArr.indexOf(item);
        var checked = newArr[index].checked;

        newArr[index].checked = !checked;

        setInviteList(newArr);

    }

    const handleCreationSelection = (item) => {
        const newArr = [...participantsArr];
        var index = newArr.indexOf(item);

        for(let i= 0; i < newArr.length; i++){
            newArr[i].checked = false;
        }

        var checked = newArr[index].checked;

        newArr[index].checked = !checked;
        setSelectedUser(newArr[index].id);

        setParticipants(newArr);
    }

    const sendInvite = () => {
        try{
            let currUid = user.uid; 
            let invite = [];

            for(let i = 0; i < inviteList.length; i++){
                var element = inviteList[i];
                
                if(element.checked){
                    invite.push({id: element.id});
                }
            }

            if(invite.length > 0){
                for(let i = 0; i < invite.length; i++){
                    var invitedUser = invite[i].id;
                
                    firebase.firestore().collection('tasks').doc(taskId).update({
                        invited: firebase.firestore.FieldValue.arrayUnion({id: invitedUser})
                    })
                    
                    firebase.firestore().collection('users').doc(invitedUser).update({
                        taskInvites: firebase.firestore.FieldValue.arrayUnion({ taskId : taskId,
                                                                                invitedBy: currUid,
                                                                                header: header})
                    })

                    invitedUsers.push({id: invitedUser});
                }

                setInviteModal(false);
            }else{
                Alert.alert("You should select at least one users");
            }

            

        }catch(e){
            Alert.alert("Something went wrong" ,e.message)
        }
    }

    const openUserModal = () => {
        getParticipants();

        setUsersModal(true);
    }

    const openInviteModal = async() => {
        await getInviteList();
        setInviteModal(true);
        console.log(invitedUsers);
    }

    const openSubtaskModal = async() => {
        setSubtaskName('');
        getParticipants();

        console.log(participantsArr)
        setSubtaskModal(true);
    }

    const closeSubtaskModal = () => {
        const newArr = [...participantsArr];

        for(let i = 0; i < participantsArr.length; i++){
            newArr[i].checked = false;
        }
        
        setParticipants(newArr);

        setSubtaskModal(false);
    }


    return (
    
        <SafeAreaView style={[styles.container, usersModal || inviteModal || subtaskModal ? {backgroundColor: 'rgba(0,0,0,0.5)'} : '']} >
                       
            <View style={styles.header}> 
                <TouchableHighlight style={{marginLeft: 25, height: 50, justifyContent: 'center', alignItems: 'center'}} 
                                    onPress={() => navigation.goBack()}
                                    activeOpacity={0} 
                                    underlayColor={'white'}>
                    
                    <Ionicons name="ios-chevron-back-outline" size={24} color="black" />
                </TouchableHighlight>
                                
                <Text style={{fontSize: 16, fontWeight: '300'}}>{header}</Text>

                <View style={{marginRight: 20,justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                    
                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}}
                                        onPress={() => openUserModal()}
                                        activeOpacity={0}>
                        <Image source={require('../assets/users_icon.png')} style={{height: 36, width: 42}}/>                    
                    </TouchableOpacity>    
                    
                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginRight: 5}}
                                        onPress={() => openInviteModal()}
                                        activeOpacity={0}>

                        <Image source={require('../assets/invite_icon.png')} style={{height: 42, width: 48}}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', marginRight: 10}}
                                        onPress={() => openSubtaskModal()}
                                        activeOpacity={0}>

                        <Image source={require('../assets/add_icon.png')} style={{height: 42, width: 42}}/>
                    </TouchableOpacity>
                
                </View>   
           
            </View>     

            <View style={styles.subtasks}>
                
                <SectionList    sections={DATA}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                ListHeaderComponent={() => {
                                    return(
                                        <View style={{width: width * 85 / 100, borderRadius: 10}}>
                                            <Text style={{fontWeight: '300', textAlign: 'center', padding: 5}}>Information</Text>
                                            <Text style={{fontWeight: '200', marginTop: 5, padding: 5}}>{information}</Text>
                                        </View>
                                    )
                                }}
                                stickyHeaderIndices={false}
                                renderItem={({ item, section }) => {
                                    return(
                                    <View style={[styles.item, usersModal || inviteModal || subtaskModal || section.title === "Done" ? 
                                                    {backgroundColor: 'rgba(0,0,0,0.1)'} : '']}>
                                               
                                        <View style={{flex: 0.85, justifyContent: 'center', alignItems: 'flex-start'}}>
                                           
                                            <Text style={[{fontWeight: '300', fontSize: 16, marginLeft: 15}, section.title === "Done" ? {color: 'rgba(0,0,0,0.4)'} : '']}>{item.title}</Text>
                                        
                                        </View>
                        
                                        { section.title === "Your Tasks" ?
                                        <View   style={{flex: 0.15, alignItems: 'center'}}>
                                            <TouchableHighlight style={{height: 30, width: 30, borderRadius: 25, alignItems: 'center', justifyContent: 'center'}}
                                                                onPress={() => doneAlert(item)}
                                                                activeOpacity={0}
                                                                underlayColor={'#D6C1C1'}>
                                                <View style={{height: 25, width: 25, borderRadius: 20, borderWidth: 0.7}}></View>
                                            </TouchableHighlight> 
                                        </View>
                                        : <View style={{flex: 0.15}}></View>
                                        }
                                    </View>)
                                }}
                                renderSectionHeader={({ section }) => {
                                    return(
                                        <View style={styles.section}>
                                            { section.data.length > 0 ?
                                            <Text style={{fontSize: 12, fontWeight: '300'}}>{section.title}</Text>
                                            : null
                                            }
                                        </View>
                                    )
                                }} 
                                />

            </View>

            <Modal  animationType="slide"
                    transparent={true}
                    visible={usersModal}
                    onRequestClose={() => setUsersModal(false)}>

                <View style={{flex: 1}}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => setUsersModal(false)}>

                    </TouchableOpacity>

                    <View style={styles.modalContainer}>

                        <Text style={{flex: 0.05, marginTop: 25, fontSize: 16, fontWeight: '300'}}>Participants</Text>

                        <View style={{flex: 0.80}}>
                            <FlatList   style={{flex: 1}}
                                        data={participantsArr}
                                        keyExtractor={item => item.id.toString()}
                                        renderItem={({item}) => {
                                            return(
                                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', 
                                                                width: width * 75 / 100, height: 55,marginTop: 10}}>
                                                        
                                                    <View >    
                                                        { imageLoading ? <ActivityIndicator size="small" /> 
                                                        : null
                                                        }

                                                        <Image  source={{uri: item.imageUrl}} 
                                                                style={{width: 48, height: 48, borderRadius: 30}}
                                                                onLoadStart={() => setImageLoading(true)}
                                                                onLoad={() => setImageLoading(false)}
                                                                onLoadEnd={() => setImageLoading(false)} />

                                                    </View>

                                                    <Text style={{ textAlign: 'center', marginLeft: 20, fontSize: 16, 
                                                                    fontWeight: '300'}}>{item.username}</Text>
                                                    { creator === item.id ? 
                                                        <AntDesign name="staro" size={16} color="gray" style={{marginLeft: 10}}/> 
                                                        : 
                                                        null
                                                    }
                                                </View>
                                            )}
                                        }
                            /> 
                        </View>
                        
                        <View style={{width: width * 70 / 100, flex: 0.15, justifyContent: 'center', alignItems: 'flex-start', 
                                        flexDirection: 'row'}}>
                            <TouchableOpacity   style={{borderRadius: 10, justifyContent: 'center', alignItems: 'center',
                                                         backgroundColor: '#E8D1D1', width: 110, height: 40, borderRadius: 10}}
                                                onPress={() => leaveAlert()}>
                                <Text style={{fontSize: 16, marginLeft: 5, fontWeight: '300'}}>Leave</Text>
                            </TouchableOpacity>

                        </View>
                    
                    </View>
                
                </View>

            </Modal>

            <Modal  animationType="slide"
                    transparent={true}
                    visible={inviteModal}
                    onRequestClose={() => setInviteModal(false)}>

                <View style={{flex: 1}}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => setInviteModal(false)}>

                    </TouchableOpacity>

                    <View style={styles.modalContainer}>
                        
                        {   !inviteLoading ? 
                        <View style={{flex: 0.75, justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                                { inviteList.length > 0 ? 
                                <FlatList   style={{flex: 1, width: 320}}
                                            data={inviteList}
                                            keyExtractor={item => item.id.toString()}
                                            renderItem={({item}) => {
                                                return(
                                                    <View style={{flexDirection: 'row', alignItems: 'center', 
                                                                    width: width * 85 / 100, justifyContent: 'center',
                                                                        height: 55 ,marginTop: 10}}>
                                                        
                                                        <View style={{width: width / 6, justifyContent: 'center'}}>       
                                                            { imageLoading ? <ActivityIndicator size="small" style={{marginTop: 120}}/> 
                                                            : null
                                                            }
                                                            <Image  source={{uri: item.imageUrl}} 
                                                                    style={{width: 48, height: 48, borderRadius: 30,}} 
                                                                    onLoadStart={() => setImageLoading(true)}
                                                                    onLoad={() => setImageLoading(false)}
                                                                    onLoadEnd={() => setImageLoading(false)}
                                                                    />
                                                        </View>    
                                                        
                                                        <TouchableHighlight style={{width: width / 2, height: 55, justifyContent:'center'}}
                                                                            onPress={() => setSelection(item)}
                                                                            activeOpacity={0} 
                                                                            underlayColor={'white'}>
                                                            <Text style={{fontSize: 16, fontWeight: '300'}}>{item.username}</Text>
                                                        </TouchableHighlight>

                                                        { invitedUsers.findIndex(obj => obj.id === item.id) > -1 ?
                                                        <Text style={{width: width/7, fontWeight: '200', fontStyle: 'italic'}}>Invited</Text>
                                                        :
                                                        <TouchableHighlight style={{width: width/ 7,  height: 55,justifyContent: 'center', 
                                                                                    alignItems: 'center'}}
                                                                            onPress={() => setSelection(item)}
                                                                            activeOpacity={0} 
                                                                            underlayColor={'white'}>
                                                            { item.checked ?
                                                            <Ionicons name="md-checkmark-circle" size={28} color="#C4B1B1"/>
                                                            :
                                                            <View style={{width: 22, height: 22, borderWidth: 1, borderRadius: 20}}/>
                                                            }
                                                        </TouchableHighlight>
                                                        
                                                        }
                                                    
                                                    </View>
                                                )
                                }}/> 

                                :
                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    
                                    <AntDesign name="frowno" size={64} color="gray" style={{marginBottom: 50}}/>
                                    
                                    <Text style={{fontSize: 16, fontWeight: '300', marginBottom: 75, textAlign: 'center'}}>
                                        You seem to be on the same mission with all your friends or your friend list is empty
                                    </Text>
                               
                                </View>
                            }
                        </View>
                        : 
                        <ActivityIndicator size= 'large' color= 'gray' /> 
                        }
                      
                        { inviteList.length > 0 ?
                        <View style={{flex: 0.25, justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableHighlight style={{width: 110, height: 40, borderRadius: 10, backgroundColor: '#E8D1D1', 
                                                            justifyContent: 'center', alignItems: 'center'}}
                                                onPress={() => sendInvite()}//I am here 
                                                activeOpacity={0}
                                                underlayColor={'#E8D1D1'}>
                                <Text style={{fontSize: 16, fontWeight: '300'}}>Invite</Text>
                            </TouchableHighlight>
                        </View>
                        : null
                        }

                    </View>
                </View>

            </Modal>

            <Modal  animationType="slide"
                    transparent={true}
                    visible={subtaskModal}
                    onRequestClose={() => closeSubtaskModal()}>

                <View style={{flex: 1}}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => closeSubtaskModal()}>

                    </TouchableOpacity>

                    <View style={styles.modalContainer}>
                        
                        <View style={{flex: 0.2,justifyContent: 'center', alignItems: 'center'}}>
                            <TextInput style={{fontSize: 14, width: width / 1.2, height: 40,
                                                borderWidth: 1, borderRadius: 10, alignItems: 'center', padding: 5,
                                                borderColor: '#F1F1F1'}}
                                        placeholder= 'Subtask'
                                        placeholderTextColor='#545C36'
                                        value={subtaskName}
                                        onChangeText={txt => setSubtaskName(txt)}/>                           
                        </View>

                        <View style={{flex: 0.6, justifyContent: 'center', alignItems: 'center'}}>
                            <FlatList   style={{width: width / 1.2, borderWidth: 1, borderRadius: 10, borderColor: '#F1F1F1'}}
                                        data={participantsArr}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({item}) => {

                                            return(    
                                                <View style={{width: width / 1.3, flexDirection: 'row', justifyContent: 'flex-start', 
                                                                alignItems: 'center', marginTop: 10, marginBottom: 10}}>
                                                    <View style={{width: 100, justifyContent: 'center', alignItems: 'center'}}>
                                                        <Image source={{uri: item.imageUrl}} style={{width: 48, height: 48, 
                                                                                                    borderRadius: 24}}/>
                                                    </View>
                                                    
                                                    <TouchableHighlight style={{width: 150, height: 48,justifyContent: 'center'}}
                                                                        onPress={() => handleCreationSelection(item)}
                                                                        activeOpacity={0} 
                                                                        underlayColor={'white'}>
                                                        <Text style={{fontSize: 16, fontWeight: '300'}}>{item.username}</Text>
                                                    </TouchableHighlight>

                                                    <TouchableHighlight style={{justifyContent: 'center', alignItems: 'center', 
                                                                                width: 60, height: 50}}
                                                                        onPress={() => handleCreationSelection(item)}
                                                                        activeOpacity={0} 
                                                                        underlayColor={'white'}>
                                                        { item.checked ?
                                                            <Ionicons name="md-checkmark-circle" size={28} color="#C4B1B1"/>
                                                            :
                                                            <View style={{width: 22, height: 22, borderWidth: 1, borderRadius: 20}}/>
                                                        }
                                                    </TouchableHighlight>

                                                </View>
                                            )
                                        }}
                                        />
                        </View>

                        <View style={{flex: 0.2, justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableHighlight style={{width: 110, height: 40, borderRadius: 10, backgroundColor: '#E8D1D1',
                                                        justifyContent: 'center', alignItems: 'center'}}
                                                onPress={() => createSubtask()}
                                                activeOpacity={0} 
                                                underlayColor={'#E8D1D1'}>
                                <Text style={{fontSize: 16, fontWeight: '300'}}>Create</Text>
                            </TouchableHighlight>
                        </View>

                    </View>
                </View>

            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    header:{
        flex:0.5,
        justifyContent: 'space-between',
        alignItems:'center',
        flexDirection: 'row',
    },
    information:{
        flex: 0.7,
        borderBottomWidth: 0.5,
    },
    subtasks:{
        flex:6,
        marginTop: 10,
        marginBottom: 50,
        alignItems: 'center',
    },
    section:{
        justifyContent: 'center', 
        width: width * 40 /100,
        marginTop: 10,
    },
    item:{
        backgroundColor: '#E8D1D1',
        flexDirection: 'row',
        padding: 5, 
        height: 65,
        width: width * 85 / 100,
        marginTop: 8,
        marginBottom: 5,
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    modalContainer:{
        flex: 3,
        backgroundColor: '#fff',
        borderColor: '#EDEDED',
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 20,
    },
});

export default InTaskScreen;
