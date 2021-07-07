import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TaskScreen from '../screens/TaskScreen';
import ContacsScreen from '../screens/ContacsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import TaskStack from '../stacks/TaskStack';
import TabBar from './TabBar';

const Tab = createBottomTabNavigator();

const Tabs = () => {
    return(
        <Tab.Navigator tabBar = {props => <TabBar {...props} /> } >
            <Tab.Screen name="Tasks" component={TaskStack} initialParams={{icon: "ios-home-outline"}} />
            <Tab.Screen name="Notifications" component={NotificationScreen} initialParams={{icon: 'md-notifications-outline'}} />
            <Tab.Screen name="Contacs" component={ContacsScreen} initialParams={{icon: "md-person-outline"}} />
        </Tab.Navigator>
    );
};

export default Tabs;