import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text, Image, Dimensions,TouchableOpacity, Modal, Alert, ActivityIndicator, 
        SafeAreaView, FlatList, TextInput, RefreshControl} from 'react-native';
import { useEffect } from 'react';
import {SwipeListView} from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import 'firebase/firebase-storage';
import 'firebase/firestore';
import firebase from 'firebase';

import SearchCard from '../components/SearchCard.js';
import FriendCard from '../components/FriendCard.js';

import {AuthContext} from '../stacks/AuthProvider';


const width = Dimensions.get('window').width;


const ContacsScreen = ({navigation}) =>{

    const {user} = useContext(AuthContext);
    const [userInfos, setUserInfos] = useState([]);
    const currentUid = user.uid;
    
    const [search, setSearch] = useState();
    const [searchList, setSearchList] = useState([]);
    const empty = [];

    const [friends, setFriends] = useState([]);
    
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

    const {logout} = useContext(AuthContext);


    const getUserInfo = async() => {
        try{
            await firebase.firestore().collection('users').doc(currentUid).get().then(documentSnapshot => {
                setUserInfos(documentSnapshot.data());
            })
        }catch(e){
            Alert.alert('Something went wrong', e.message)
        }
    }

    const getFriends = async() => {
        try{
            setFriends([]);

            await firebase.firestore().collection('users').doc(currentUid).get().then((documentSnapshot) => {
                const friendList = documentSnapshot.data().friends;

                friendList.forEach(element => {
                    firebase.firestore().collection('users').doc(element.id).get().then(doc => {
                        let ele = doc.data();

                        if(friends.findIndex(obj => obj.id === ele.id) > -1 ){
                            null
                        }else{
                            setFriends(arr => [...arr, ele]);
                        }
                    })
                })
            
            })

        }catch(e){
            Alert.alert('Something went wrong', e.message)
        }
    }

    const deleteAlert = (itemUser) => {

        Alert.alert(
            "Delete",
            "Do you want to delete friend?",
            [
                {
                    text: "Yes",
                    onPress: () => deleteFriend(itemUser),
                    style: "cancel"
                },
                {
                    text:"Cancel",
                    style: "cancel"
                },
            ]
        )
    }

    const deleteFriend = async(itemUser) => {
        try{
            await firebase.firestore().collection('users').doc(currentUid).update({
                friends : firebase.firestore.FieldValue.arrayRemove({   id: itemUser.id})
            }).then(() => {
                firebase.firestore().collection('users').doc(itemUser.id).update({
                    friends : firebase.firestore.FieldValue.arrayRemove({   id: currentUid})
                })
            })
            //setFriends([]);
            
            onRefresh();
        }catch(e){
            Alert.alert("Something went wrong", e.message)
        }
    }

    useEffect(() => {
        getUserInfo();

        setLoading(false);
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getFriends();
            
            console.log(friends);
            
        });
    
        return unsubscribe;
      }, [navigation]);


    const querySearch = async(text) => {
        
        try{
            await firebase.firestore().collection('users').orderBy('username').where('username', '!=', userInfos.username)
            .startAt(text).endAt(text + '\uf8ff').get()
            .then((querySnapshot) => {
                let items = [];
                querySnapshot.forEach((doc) => {

                if(friends.findIndex(obj => obj.id === doc.data().id) > -1){
                    null;
                }
                else {
                    items.push(doc.data());
                }
                    
                })

                if(text === ""){
                    setSearchList(null);
                }
                else{
                    setSearchList(items);
                }

                
            })
        }catch(e){
            Alert.alert('Something went wrong', e.message)
        }
    }

    const closeHandler = () => {
        setAddVisible(false);
        setSearchList(empty);
    }

    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
      }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        getFriends();
        wait(1000).then(() => setRefreshing(false));
    }, []);


    return(
        <SafeAreaView style={[styles.container, modalVisible || addVisible ? {backgroundColor: 'rgba(0,0,0,0.5)'} : '']}>
            
            <View style={[styles.container, modalVisible || addVisible ? {backgroundColor: 'rgba(0,0,0,0.5)'} : '']}>

                <View style={styles.topHead}>
                    <Text style={[styles.headText, modalVisible || addVisible ? {opacity: 0.3} : 1]}>Contacts</Text>

                    <TouchableOpacity onPress={() => setAddVisible(true)}>
                        <Image source={require('../assets/add_icon.png')} style={styles.addIcon}/>
                    </TouchableOpacity>
                
                </View>
                
                

                <View style={styles.contactsList}>
                    
                    <SwipeListView  showsVerticalScrollIndicator={true}
                                    style={styles.wrapper}
                                    keyExtractor={(item) => item.id.toString()}
                                    data={friends}
                                    leftOpenValue={60}
                                    stopLeftSwipe={280}
                                    previewOpenValue={5}
                                    previewOpenDelay={3000}
                                    disableLeftSwipe
                                    ListHeaderComponent={() => {
                                        return(
                                        <View style={[styles.header, modalVisible || addVisible ? {borderBottomColor: 'rgba(0,0,0,0.1)'} : '']}>

                                            <View style={styles.imageSide}>
                                                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.highligt}>
                                                
                                                    <Image source={{uri: userInfos.imageUrl}} style={[styles.userImage, modalVisible || addVisible ? {opacity: 0.05} : 1]} />
                                            
                                                </TouchableOpacity>
                                            </View>
                        
                                            <View style={styles.userInfos}>              
                                                <Text style={[styles.usernameText, modalVisible || addVisible ? {opacity: 0.3} : 1]}>{userInfos.username}</Text>
                        
                                                <Text style={[styles.emailText, modalVisible || addVisible ? {opacity: 0.3} : 1]}>{userInfos.email}</Text>
                                            </View>
                                        </View>
                                        )
                                    }}
                                    refreshControl={
                                        <RefreshControl refreshing={refreshing}
                                                        onRefresh={onRefresh}
                                        />
                                    }
                                    
                                    renderItem={({item}) => (
                                        <FriendCard username={item.username}
                                                    image={item.imageUrl}
                                                    addVisible={addVisible}
                                                    modalVisible={modalVisible}
                                        />
                                    )}
                                    renderHiddenItem={({item}) => (
                                    
                                    <View style={[styles.hiddenItem,  modalVisible || addVisible ? 
                                                {backgroundColor: 'rgba(0,0,0,0.001)'} : '']}>
                                        
                                        <TouchableOpacity style={styles.hiddenTouch} onPress={() => deleteAlert(item)}>
                                            {addVisible || modalVisible ? null : 
                                            <MaterialIcons  name="delete-outline" 
                                                            size={22} 
                                                            color="black" 
                                                            style={{marginLeft: 10}}/>
                                            }
                                        </TouchableOpacity>
                                    
                                    </View> 
                                    

                                    )}
                                    
                    /> 

                </View>

            </View>
            
            
            <Modal animationType='slide'
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}>
                    
                    <View style={styles.deneme}>
                        
                        <TouchableOpacity style={styles.quitModal} onPress={() => setModalVisible(false)}>

                        </TouchableOpacity>

                        <View style={styles.modal}>
                            
                            <TouchableOpacity style={styles.modalContent}>
                                <MaterialIcons name="photo-library" size={24} color="black" style={styles.icons}/>
                                <Text style={styles.modalText}>Change Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalContent} onPress={() => logout()} >
                                <MaterialIcons name="logout" size={24} color="black" style={styles.icons}/>
                                <Text style={styles.modalText}>Logout</Text>
                            </TouchableOpacity>
                        
                        </View>
                    </View>

            </Modal>

        
            

            <Modal  animationType='slide'
                    transparent={true}
                    visible={addVisible}
                    onRequestClose={() => setModalVisible(!addVisible)}>

                <View style={styles.addModalCont}>

                    <TouchableOpacity style={styles.quitArea} onPress={() => closeHandler()}>

                    </TouchableOpacity>

                    <View style={styles.addModal}>
                        
                        
                        <View style={styles.searchBox}>

                            
                            <Ionicons name="search-outline" size={16} color="#545C36" />

                            <TextInput  style={styles.inputBox}
                                        value={search}
                                        onChangeText={search => querySearch(search)}
                                        placeholder='Search'
                                        autoCapitalize='none'
                                        clearButtonMode = 'always'
                                        inlineImageLeft = 'search_icon'
                                        placeholderTextColor='#545C36'/>

                        </View>

                        <View style={styles.searchList}>
                            
                            <FlatList   style={styles.wrapper}
                                        keyExtractor={(item) => item.id}
                                        data={searchList}
                                        renderItem={({ item }) => (
                                            
                                            <SearchCard username={item.username}
                                                        itemId={item.id}
                                                        image={item.imageUrl}
                                                        currentUid={currentUid}
                                                        currentUsername={userInfos.username}
                                                        currentUserImage={userInfos.imageUrl}/>
                                        
                                        )} 
                            />

                        </View>
                    </View>
                </View>

            </Modal>
        
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
    },
    topHead:{
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
        marginTop: 4,
    },
    addIcon:{
        width: 42,
        height: 42,
        marginRight: 15,
        marginTop: 4,
    },
    header:{
        flex: 1,
        flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center',
    },
    imageSide:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    highligt:{
        width: 64,
        height: 64,
        borderRadius: 64,
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
    },
    userImage: {
        width: 64,
        height: 64,
        borderRadius: 64,
    },
    userInfos:{
        flex:3,
        justifyContent: 'flex-start'
    },
    usernameText:{
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '200',
    },
    emailText:{
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '100',
        marginTop: 5,
        marginBottom: 5,
    },
    contactsList:{
        flex: 4,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal:{
        flex: 0.8,
        backgroundColor: '#FCFCFC',
        borderWidth: 1,
        borderColor: '#E6E6E6',
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 20,
    },
    modalContent:{
        flexDirection: 'row',
        width,
        alignContent: 'center',
        padding: 15,
        marginBottom: 5,
        borderBottomWidth: 0.5,
    },
    modalText:{
        fontSize: 18,
        marginLeft: 12,
    },
    icons:{
        marginLeft: 5,
    },
    deneme:{
        flex: 1,
    },
    quitModal:{
        flex: 2.2,
    },
    addModalCont:{
        flex: 1,
    },
    quitArea:{
        flex:1,
    },
    addModal:{
        flex: 4,
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
    searchBox:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        marginTop: 20,
        width: 320,
        height: 30,
        backgroundColor: '#00000000',
        borderWidth: 1,
        borderColor: '#808080',
        elevation: 3,
    },
    inputBox:{
        width: 280,
        height: 40,
        marginLeft: 2,
        backgroundColor: '#00000000'
    },
    searchList:{
        flex: 12,
        marginTop: 10,
    },
    wrapper:{
        flex: 1,
        width: 320,
    },
    hiddenItem:{
        width: 300,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems:'flex-start',
        backgroundColor: '#FF3232',
        marginLeft: 5,
        marginTop: 10,
    },
    hiddenTouch:{
        height: 55,
        width: 45,
        marginLeft: 7,
        justifyContent: 'center',
        alignContent: 'center',

    },
    
})

export default ContacsScreen;