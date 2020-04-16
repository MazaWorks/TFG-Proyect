import * as React from 'react';
import {StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRooms';
import TypeRoom from './TypeRoom';
import AddRoom from './AddRoom';

const Stack = createStackNavigator();

export default function HabitacionesNavigation({navigation}) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={MainView}
        options={{
          headerLeft: () => (
            <Icon
              name="menu"
              size={30}
              onPress={() => navigation.openDrawer()}
            />
          ),
          title: 'Home',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
        }}
      />
      <Stack.Screen
        name="TypeRoom"
        component={TypeRoom}
        options={{
          headerLeft: () => (
            <Icon
              name="close"
              size={30}
              onPress={() => navigation.navigate('Home')}
            />
          ),
          title: 'Add Room',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
        }}
      />
      <Stack.Screen
        name="AddRoom"
        component={AddRoom}
        options={{
          headerLeft: () => (
            <Icon
              name="close"
              size={30}
              onPress={() => navigation.navigate('Home')}
            />
          ),
          title: 'Add Room',
          headerStyle: {
            backgroundColor: '#125c28',
          },
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleContainerStyle: styles.headerComponents,
          headerLeftContainerStyle: styles.headerComponents,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerComponents: {
    marginLeft: '5%',
  },
});
