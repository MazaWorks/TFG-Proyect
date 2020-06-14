import * as React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRules';
import AddRule from './AddRule';
import ClauseByDevice from './ClauseByDevice';
import ChooseClause from './ChooseClause';

const Stack = createStackNavigator();

/**
 * Navegador del apartado de reglas
 */
export default function RulesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName="RM">
      <Stack.Screen
        name="RM"
        component={MainView}
        options={{
          title: 'Reglas',
          headerStyle: {
            backgroundColor: '#ffc400',
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
        name="RA"
        component={AddRule}
        options={{
          title: 'Nueva Regla',
          headerStyle: {
            backgroundColor: '#ffc400',
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleContainerStyle: {marginLeft: '5%'},
        }}
      />
      <Stack.Screen
        name="RCH"
        component={ChooseClause}
        options={{
          title: 'Módulos',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('RA')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#ffc400',
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
        name="RCD"
        component={ClauseByDevice}
        options={{
          title: 'Condiciones',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('RCH')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#ffc400',
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
