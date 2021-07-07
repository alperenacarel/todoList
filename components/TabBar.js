import React, { Component, useState } from 'react';
import { render } from 'react-dom';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Tab from './Tab';

const {width} = Dimensions.get('screen')

const TabBar = ({state, navigation}) => {
    const {routes} = state;
    const [selected, setSelected] = useState('Tasks');
    const renderColor = currentTab => (currentTab === selected ? '#69665E' : 'black');
    
    

    const handlePress = (activeTab, index) => {
        if (state.index !== index){
            setSelected(activeTab);
            navigation.navigate(activeTab);
        }
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {
                    routes.map( (route, index) => (<Tab 
                                        tab={route} 
                                        icon={route.params.icon} 
                                        onPress={ () => handlePress(route.name, index)} 
                                        color={renderColor(route.name)} 
                                        key={route.key} />))
                }
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },

    container:{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#EDEDED',
        borderStyle: 'solid',
        //width: width,
        justifyContent: 'space-between',
        //borderRadius: 15,
        elevation: 100,
        //borderTopLeftRadius: 25,
        //borderTopRightRadius: 25,
    },
});

export default TabBar;
