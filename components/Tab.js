import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign  } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const Tab = ({color, tab, onPress, icon}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={ onPress }>
            {icon && < Ionicons  name={icon} size={20} color={color} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
});

export default Tab;
