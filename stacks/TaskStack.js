import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import TaskScreen from '../screens/TaskScreen';
import InTaskScreen from '../screens/InTaskScreen';
import Task from '../components/Task';
import Tabs from '../components/Tabs';

const Stack = createStackNavigator();


const TaskStack = () => {

    return (
        
        <Stack.Navigator headerMode={'none'} >
            <Stack.Screen name={'Tasks'} component={TaskScreen} />
            <Stack.Screen name={'InTask'} component={InTaskScreen} />
        </Stack.Navigator>
    );
};


export default TaskStack;
