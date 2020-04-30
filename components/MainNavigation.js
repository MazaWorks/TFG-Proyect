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
const INITIAL_ROUTE_NAME = 'Rules';

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
          title: 'Rooms',
          drawerIcon: ({color}) => <Icon name="weekend" color={color} />,
        }}
      />
      <Drawer.Screen
        name="Devices"
        component={DevicesNavigation}
        options={{
          title: 'Devices',
          drawerIcon: ({color}) => <Icon name="cast" color={color} />,
        }}
      />
      <Drawer.Screen
        name="Rules"
        component={RulesNavigation}
        options={{
          title: 'Automation',
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
          source={require('../assets/no_user.png')}
          style={styles.profileImg}
        />
        <Text style={styles.nameApp}>BeYourHome</Text>
        <Text style={styles.username}>MazaJunior</Text>
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
  nameApp: {fontWeight: 'bold', fontSize: 16, marginTop: 10},
  username: {color: 'gray', marginBottom: 10},
});
