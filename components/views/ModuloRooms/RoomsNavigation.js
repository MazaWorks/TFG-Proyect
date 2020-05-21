import * as React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRooms';
import TypeRoom from './TypeRoom';
import AddDevices from './AddDevices';
import AddRoom from './AddRoom';
import RoomView from './RoomView';
import DeviceView from '../ModuloDevices/DeviceView';

const Stack = createStackNavigator();

export default function RoomsNavigation({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ROH"
        component={MainView}
        options={{
          title: 'Home',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
        }}
      />
      <Stack.Screen
        name="RODA"
        component={AddDevices}
        options={{
          title: 'Replace',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ROH')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleContainerStyle: {marginLeft: '5%'},
          headerLeftContainerStyle: {marginLeft: '5%'},
        }}
      />
      <Stack.Screen
        name="ROT"
        component={TypeRoom}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ROH')}>
              <Icon name="close" size={30} />
            </TouchableOpacity>
          ),
          title: 'New Room',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
        }}
      />
      <Stack.Screen
        name="ROA"
        component={AddRoom}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ROT')}>
              <Icon name="close" size={30} />
            </TouchableOpacity>
          ),
          title: 'New Room',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
        }}
      />
      <Stack.Screen
        name="ROV"
        component={RoomView}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ROH')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          title: 'Room Details',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="RODV"
        component={DeviceView}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ROV')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleContainerStyle: {marginLeft: '5%'},
          headerLeftContainerStyle: {marginLeft: '5%'},
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  headerTitleStyle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerComponents: {
    marginLeft: '5%',
  },
});
