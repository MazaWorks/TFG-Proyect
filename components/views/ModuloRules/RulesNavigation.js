import * as React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRules';
import AddRule from './AddRule';
import ClauseByDevice from './ClauseByDevice';
import ChooseClause from './ChooseClause';

const Stack = createStackNavigator();

export default function RulesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName="ModuloRules">
      <Stack.Screen
        name="ModuloRules"
        component={MainView}
        options={{
          title: 'Rules',
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
        name="AddRule"
        component={AddRule}
        options={{
          title: 'New Rule',
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
        name="ChooseClause"
        component={ChooseClause}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('AddRule')}>
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
        name="ClauseByDevice"
        component={ClauseByDevice}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('ChooseClause')}>
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
