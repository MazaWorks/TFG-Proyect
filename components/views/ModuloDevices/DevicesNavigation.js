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
    <Stack.Navigator initialRouteName="DM">
      <Stack.Screen
        name="DM"
        component={MainView}
        options={{
          title: 'Módulos',
          headerStyle: {
            backgroundColor: '#1e5885',
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
        name="DV"
        component={DeviceView}
        options={{
          title: 'Módulo Detalle',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('DM')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#1e5885',
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
        name="DS"
        component={SearchingDevices}
        options={{
          title: 'Escáner',
          headerStyle: {
            backgroundColor: '#1e5885',
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
