import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRules';

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = 'Rules';

export default function SearchDevicesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Stack.Screen
        name="Rules"
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
    </Stack.Navigator>
  );
}
