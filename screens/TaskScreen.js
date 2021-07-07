import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, Text, Image, TouchableHighlight, SafeAreaView, 
        FlatList, TouchableOpacity, StatusBar, Modal, Alert, Dimensions, TextInput, RefreshControl} from 'react-native';
import Task from '../components/Task';
import firebase from 'firebase';
import 'firebase/firebase-storage';
import part from '../assets/charlie.png';
import { AuthContext } from '../stacks/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import Parti from '../components/AddParti.js';
import AddParti from '../components/AddParti.js';

const width = Dimensions.get('screen').width;

const TaskScreen = ( { navigation } ) =>{

    const {user} = useContext(AuthContext);
    const currentUid = user.uid;

    const [username, setUsername] = useState();
    const [friends, setFriends] = useState([]);
    const [taskIds, setTaskIds] = useState([]);
    
    const [updatedFriends, setUpdatedFriends] = useState([]);
    
    const [addVisible, setAddVisible] = useState(false);

    const [header, setHeader] = useState('');
    const [information, setInformation] = useState('');

    const [tasks, setTasks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getUsername = async() => {
        try{
            await firebase.firestore().collection('users').doc(currentUid).get().then(documentSnapshot => {
                setUsername(documentSnapshot.data().username);
            })
        }catch(e){
            Alert.alert('Something went wrong', e.message)
        }
    }

    const getFriends = async() => {
        try{
            await firebase.firestore().collection('users').doc(currentUid).get().then(documentSnapshot => {
                let friendList = documentSnapshot.data().friends;

                friendList.forEach(element => {
                    firebase.firestore().collection('users').doc(element.id).get().then((doc) => {
                        let ele = doc.data();

                        if(friends.findIndex(obj => obj.id === ele.id) > -1 ){
                            null
                        }else{
                            friends.push(ele);
                        }
                    })
                });
            })

        }catch(e){
            Alert.alert('Something went wrong', e.message)
        }
    }

    const getTasks = async() => {
        try{

            await firebase.firestore().collection('users').doc(currentUid).get().then((doc) => {
                let taskIdHolder = doc.data().tasks;

                taskIdHolder.forEach(element => {
                    firebase.firestore().collection('tasks').doc(element.taskId).get().then((document) => {
                        const task = document.data();

                        if(tasks.findIndex(obj => obj.id === task.id) > -1){
                            null
                        }else{
                            setTasks(arr => [...arr, task]);
                        }
                    
                    })
                });
            })
            console.log(tasks);

        }catch(e){
            Alert.alert("Something went wrong", e.message);
        }
    }

    const openModal = () => {
        setHeader('');
        setInformation('');
        setAddVisible(true);
        
        var holder = updateFriends(friends);
        setUpdatedFriends(holder);
    }

    const closeHandler = () => {
        if(header || information != '' ){    
            Alert.alert(
                "Close",
                "Do you want to close?",
                [
                    {
                        text: "Yes",
                        onPress: () => setAddVisible(false),
                        style: "default"
                    },
                    {
                        text:"Cancel",
                        style: "cancel"
                    },
                ]
            )
        }
        else{
            setAddVisible(false);
        }
    }

    const updateFriends = (arr) => {
        let newArr = [...arr];

        return newArr.map((ele, i) => {
            return {...ele, checked: false};
        })
    }

    const setSelection = (item) => {
        const newArr = [...updatedFriends];
        var index = newArr.indexOf(item);
        var checked = newArr[index].checked;

        newArr[index].checked = !checked;

        setUpdatedFriends(newArr);

    }

    const createTask = async() => {
        const participants = [{id: currentUid}];
        const invited = []; 
        var taskId = taskIdGenerator();

        for(let i = 0; i < updatedFriends.length; i++){
            var element = updatedFriends[i];
            var checked = element.checked;
            
            if(checked){
                var newElement = {id: element.id}
                
                invited.push(newElement);
            }
        }

        if(header && information != null){
            try{
                await firebase.firestore().collection('tasks').doc(taskId)
                .set({
                    id: taskId,
                    header: header,
                    information: information,
                    participants: participants,
                    subtasks: [],
                    creator: currentUid,
                    invited: invited
                }).then(() => {
                    firebase.firestore().collection('users').doc(currentUid).update({
                        tasks : firebase.firestore.FieldValue.arrayUnion({taskId: taskId})
                    })
                }).then(() => {
                    for(let i = 0; i < invited.length; i++){
                        var invitedUser = invited[i];
                        var invetedUid = invitedUser.id;

                        firebase.firestore().collection('users').doc(invetedUid).update({
                            taskInvites : firebase.firestore.FieldValue.arrayUnion({taskId: taskId,
                                                                                    invitedBy: currentUid,  
                                                                                    header: header})
                        })
                    }
                })

                setAddVisible(false);

                navigation.navigate('InTask',  {taskId: taskId,
                                                header: header, 
                                                information: information,
                                                participants: participants,
                                                invitedUsers: invited,
                                                creator: currentUid,
                                                friends: friends,
                                                subtasks: []});
            }catch(e){
                Alert.alert("Something went wrong", e.message);
            }
        }
        else{
            Alert.alert("Header and information cannot be empty")
        }
    }

    function taskIdGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
        };

        return (S4() + S4() + S4() + "-" + S4());
    }

    /*useEffect(() => {
        //getUsername();
        //getFriends();
        getTasks();
        
        console.log(tasks);
    }, [])*/
 
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
            getFriends();
            //getTasks();
            console.log(tasks);
            //console.log(friends);
        });
    
        return unsubscribe;

    }, [navigation]);

    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        let empty = [];
        setTasks(empty);
        getTasks();
        wait(1000).then(() => setRefreshing(false));
    }, []);

    return(   

        <SafeAreaView style={[styles.container, addVisible ? {backgroundColor: 'rgba(0,0,0,0.5)'} : '']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
            <View style={styles.head}>
                <Text style={styles.headText}>Tasks</Text>

                <TouchableOpacity onPress={() => openModal()}>
                    <Image source={require('../assets/add_icon.png')} style={styles.addIcon}/>
                </TouchableOpacity>
            </View>

            <View style={styles.taskList}>
               
                <FlatList style={styles.wrapper} 
                          keyExtractor={(item) => item.id.toString() }
                          data={tasks}
                          renderItem={({ item }) => (
                                <Task   
                                        header={item.header}
                                        information={item.information}
                                        participants={item.participants} 
                                        invited={item.invited}
                                        creator={item.creator}
                                        subtasks={item.subtasks}
                                        friends={friends}
                                        navigation={navigation}
                                        currentUid={currentUid}
                                        id={item.id}
                                        addVisible={addVisible}
                                />
                          )}
                          refreshControl={
                            <RefreshControl refreshing={refreshing}
                                            onRefresh={onRefresh}
                            />
                        }
                />
                    
            </View>

            <Modal  animationType="slide"
                    transparent={true}
                    visible={addVisible}
                    onRequestClose={() => setModalVisible(!addVisible)}>

                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeModal} onPress={() => closeHandler()}>

                    </TouchableOpacity>
                
                    <View style={styles.addTaskContainer}>
                         
                        <View   style={styles.header}>
                            <TextInput  style={{flex: 1}}
                                        value={header}
                                        maxLength={20}
                                        onChangeText={(header) => setHeader(header)}
                                        placeholder='Header'
                                        autoCapitalize='words'
                                        fontWeight= '200'
                                        placeholderTextColor='#545C36'/>
                        </View>

                        <View   style={styles.info}>
                            <TextInput  style={{flex: 1}}
                                        value={information}
                                        onChangeText={(information) => setInformation(information)}
                                        placeholder='Information'
                                        autoCapitalize='sentences'
                                        placeholderTextColor='#545C36'
                                        fontWeight= '200'
                                        multiline={true}/>
                        </View>

                        <View style={styles.participants}>
                                
                            <View style={styles.subheader}>        
                                <Text style={{fontWeight: '200', fontSize: 15,}}>Invite</Text>
                            </View>
                        
                            <View style={styles.partList}>
                                <FlatList   style={styles.partWrapper}
                                            data={updatedFriends}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => {
                                                return(
                                                    <View  style={styles.itemRow}>
                                                        <TouchableHighlight style={{flex: 0.9}} 
                                                                            onPress={() => setSelection(item)} 
                                                                            activeOpacity={0} 
                                                                            underlayColor={'white'}>
                                                            
                                                            <AddParti   image={item.imageUrl}
                                                                        username={item.username}/>
                                                        
                                                        </TouchableHighlight>
                                                        
                                                        <TouchableHighlight style={{flex: 0.1}} 
                                                                            onPress={() => setSelection(item)} 
                                                                            activeOpacity={0} 
                                                                            underlayColor={'white'}>
                                                            
                                                                {item.checked ? 
                                                                <Ionicons name="md-checkmark-circle" size={22} color="#C4B1B1"/>
                                                                : <View style={styles.itemCheckBox}></View>}    
                                                            
                                                        </TouchableHighlight>
                                                    </View>
                                                )
                                            }}/>

                                

                            </View>
                        
                        </View>
                        
                        <TouchableOpacity   style={styles.createButton} onPress={() => createTask()}>
                            <Text   style={{fontWeight: '300', fontSize: 16}}>Create</Text>
                        </TouchableOpacity>

                    </View>
                            
                </View>

            </Modal>
            
            
        
        </SafeAreaView>

    );

}

const styles = StyleSheet.create({
    container:{
        flex:1, 
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    head:{
        flex: 0.5,
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
    addIcon:{
        width: 42,
        height: 42,
        marginRight: 15,
    },

    taskList:{
        flex: 4.8,
    },

    wrapper:{
        marginTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
        //marginBottom: 25,
    },
    modal:{
        flex: 1,
    },
    closeModal:{
        flex:1,
    },
    addTaskContainer:{
        flex: 3.5,
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
    header:{
        flex: 0.055,
        width: width * 85 /100, 
        justifyContent: 'center',
        alignContent: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        borderRadius: 10,
        marginBottom: 10,
    },
    info:{
        flex: 0.2,
        width: width * 85 /100,
        borderWidth: 0.8,
        borderColor: '#F1F1F1',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    participants:{
        flex: 0.6,
        width: width * 85 /100,
        borderWidth: 0.8,
        borderColor: '#F1F1F1',
        alignContent: 'center',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    subheader: {
        flex: 0.1, 
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    partList: {
        marginTop: 2,
        flex: 0.8,
    },
    partWrapper:{
        flex: 1,
        width: 320,
    },
    createButton:{
        marginTop: 10,
        marginBottom: 10,
        width : 110,
        height: 40,
        borderRadius: 10,
        backgroundColor:'#E8D1D1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemRow:{
        flex: 1,
        justifyContent: 'flex-start',
        padding : 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        alignItems: 'center',
        flexDirection: 'row',
        width: width * 75 / 100,
        marginTop: 5,
    },
    itemCheckBox:{
        width: 20,
        height: 20,
        borderWidth: 0.5,
        borderColor: '#5E5555',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    

})

export default TaskScreen;