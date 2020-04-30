import * as React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {createStackNavigator} from '@react-navigation/stack';
import MainView from './ModuloRules';
import RuleView from './RuleView';
import AddRule from './AddRule';
import ClauseByDevice from './ClauseByDevice';
import ChooseClause from './ChooseClause';

const Stack = createStackNavigator();

export default function RulesNavigation({navigation}) {
  return (
    <Stack.Navigator initialRouteName="Reglas">
      <Stack.Screen
        name="Reglas"
        component={MainView}
        options={{
          title: 'Rules',
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
        name="RuleView"
        component={RuleView}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('Reglas')}>
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
        name="AddRule"
        component={AddRule}
        options={{
          title: 'New Rule',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('Reglas')}>
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
        name="ClauseByDevice"
        component={ClauseByDevice}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={styles.iconHeaderContainer}
              onPress={() => navigation.navigate('AddRule')}>
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
