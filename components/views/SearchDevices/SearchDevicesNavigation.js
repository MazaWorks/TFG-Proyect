import * as React from 'react';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloDevices';
import DeviceView from './DeviceView';
import SearchingDevices from './SearchingDevices';

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Devices';

export default function SearchDevicesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Stack.Screen
        name="Devices"
        component={MainView}
        options={{
          headerLeft: () => (
            <Icon name="menu" onPress={() => navigation.openDrawer()} />
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
        name="DeviceView"
        component={DeviceView}
        options={{
          headerLeft: () => (
            <Icon
              name="arrow-left"
              type="material-community"
              onPress={() => navigation.navigate('Devices')}
            />
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
            <Icon
              name="arrow-left"
              type="material-community"
              onPress={() => navigation.navigate('Devices')}
            />
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
