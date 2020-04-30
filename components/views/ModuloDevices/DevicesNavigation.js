import * as React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloDevices';
import DeviceView from './DeviceView';
import SearchingDevices from './SearchingDevices';

const Stack = createStackNavigator();

export default function DevicesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName="Devices">
      <Stack.Screen
        name="Devices"
        component={MainView}
        options={{
          headerStyle: {
            backgroundColor: '#00a82a',
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
        name="DeviceView"
        component={DeviceView}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('Devices')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#00a82a',
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
        name="SearchingDevices"
        component={SearchingDevices}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('Devices')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#00a82a',
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
});
