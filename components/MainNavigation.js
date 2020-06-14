import * as React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {Icon} from 'react-native-elements';
import RoomsNavigation from './views/ModuloRooms/RoomsNavigation';
import DevicesNavigation from './views/ModuloDevices/DevicesNavigation';
import RulesNavigation from './views/ModuloRules/RulesNavigation';
import {View, Text, Image, StyleSheet} from 'react-native';

const Drawer = createDrawerNavigator();
const INITIAL_ROUTE_NAME = 'Rooms';

/**
 * Navigation Drawer
 * Este es el navegador principal de la aplicación
 */
export default function MainNavigation() {
  return (
    <Drawer.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      drawerType={'slide'}
      backBehavior={'order'}
      drawerStyle={styles.drawerStyle}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Rooms"
        component={RoomsNavigation}
        options={{
          title: 'Habitaciones',
          drawerIcon: ({color}) => <Icon name="weekend" color={color} />,
        }}
      />
      <Drawer.Screen
        name="Devices"
        component={DevicesNavigation}
        options={{
          title: 'Módulos',
          drawerIcon: ({color}) => <Icon name="devices" color={color} />,
        }}
      />
      <Drawer.Screen
        name="Rules"
        component={RulesNavigation}
        options={{
          title: 'Automatización',
          drawerIcon: ({color}) => (
            <Icon
              name="home-automation"
              type="material-community"
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={require('../assets/drawerIcon.png')}
          style={styles.profileImg}
        />
        <Text style={styles.nameApp}>Stay Home Domótica</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
const styles = StyleSheet.create({
  drawerStyle: {
    backgroundColor: '#ffc400',
    width: '80%',
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 20,
  },
  drawerHeader: {
    alignItems: 'center',
  },
  nameApp: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
});
