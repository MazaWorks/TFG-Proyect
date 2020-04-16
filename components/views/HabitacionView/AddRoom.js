/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, StyleSheet, Text, TextInput} from 'react-native';
import {Icon} from 'react-native-elements';
import {useDimensions} from '@react-native-community/hooks';

export default function TypeRoom({navigation, route}) {
  const [roomName, onChangeText] = useState(route.params.itemName);
  const {height} = useDimensions().window;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="done"
          size={30}
          onPress={() => {
            var newValue = Object.assign([], route.params.rooms);
            var proceed = true;
            for (let elements of newValue) {
              if (elements.name === roomName) {
                proceed = false;
                break;
              }
            }
            if (proceed) {
              newValue.push({
                idRoom: route.params.itemId,
                name: roomName,
                numberDevices: 0,
              });
              navigation.navigate('Home', {
                newRooms: newValue,
                addIndicator: true,
              });
            } else {
              navigation.navigate('Home');
            }
          }}
        />
      ),
      headerRightContainerStyle: {marginRight: '5%'},
    });
  }, [navigation, roomName, route.params.rooms, route.params.itemId]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.listHeader,
          {
            marginTop: height * 0.05,
            marginBottom: height * 0.03,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          Editar Habitación
        </Text>
      </View>

      <View style={styles.inputNameContainer}>
        <Text style={styles.text}>Nombre: </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={text => onChangeText(text)}
          value={roomName}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ffff',
  },
  listHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputNameContainer: {
    alignItems: 'center',
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: 'row',
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: '10%',
    marginRight: '10%',
  },
  textInput: {
    width: '100%',
  },
});
