/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useDimensions} from '@react-native-community/hooks';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getDevicesExceptRoom} from '../../common/Dao';

export default function TypeRoom({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [roomName, onChangeText] = useState(route.params.itemName);
  const [devices, getDevices] = useState([]);
  const [press, onPress] = useState({
    indicator: false,
    data: [],
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    getDevicesExceptRoom(roomName).then(value => {
      getDevices(value);
      setLoading(false);
    });
  }, [roomName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.iconHeaderContainer}
          onPress={() => {
            navigation.navigate('ROH', {
              newRoom: {
                idRoom: route.params.itemId,
                name: roomName,
                numberDevices: 0,
              },
              devices: press.data,
              addIndicator: true,
            });
          }}>
          <Icon name="done" size={30} />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {marginRight: '5%'},
    });
  }, [navigation, press.data, roomName, route.params.itemId]);

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
            backgroundColor:
              press.indicator && press.data.indexOf(data) >= 0
                ? 'rgba(0,0,0,0.2)'
                : 'white',
          },
        ]}
        onPress={() => {
          var newPress = Object.assign([], press.data);
          var añadimos = true;
          for (let device of newPress) {
            if (device.ip === data.ip) {
              añadimos = false;
              break;
            }
          }
          if (añadimos) {
            newPress.push(data);
            onPress({indicator: true, data: newPress});
          } else {
            newPress.splice(newPress.indexOf(data), 1);
            onPress({indicator: true, data: newPress});
          }
        }}>
        <Image
          source={srcImage}
          style={[
            listStyles.image,
            {
              width: (width * 0.8) / 6,
              height: (width * 0.8) / 6,
            },
          ]}
          resizeMode="contain"
        />
        <View style={{width: (width * 0.8 * 4) / 6}}>
          <Text style={listStyles.name}>{data.name}</Text>
          <Text style={listStyles.subtitle}>
            {data.room != null ? data.room : 'No Asignado'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={noDeviceStyles.loadingContainer}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 90}
          color="#0000ff"
        />
      </View>
    );
  }

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
          maxLength={18}
          onChangeText={text => onChangeText(text)}
          value={roomName}
        />
      </View>

      {(devices.length === 0 && (
        <View style={noDeviceStyles.container}>
          <View style={noDeviceStyles.mainContainer}>
            <Image
              source={require('../../../assets/Devices/noModules.png')}
              style={[
                noDeviceStyles.image,
                {
                  width: width * 0.6,
                  height: width * 0.36,
                },
              ]}
              resizeMode="contain"
            />
            <View style={noDeviceStyles.header}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                No hay Módulos disponibles
              </Text>
            </View>
          </View>
        </View>
      )) ||
        (devices.length !== 0 && (
          <View>
            <View
              style={[
                listStyles.header,
                {
                  marginBottom: height * 0.05,
                },
              ]}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                Elige Módulos a mover a
              </Text>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>{roomName}</Text>
            </View>
            <OptimizedFlatList
              style={{
                width: width * 0.8,
                marginBottom: height * 0.04,
              }}
              data={devices}
              renderItem={({item}) => <Item data={item} />}
              containerStyle={listStyles.mainContainer}
              keyExtractor={(item, index) => index.toString()}
              numColumns={1}
            />
          </View>
        ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  header: {
    marginTop: '10%',
    marginBottom: '5%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  mainContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignContent: 'center',
    padding: 10,
  },
  image: {
    alignSelf: 'center',
    marginRight: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0ffff',
    alignItems: 'center',
  },
  listHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputNameContainer: {
    width: '100%',
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
    width: '65%',
  },
});

const noDeviceStyles = StyleSheet.create({
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f0ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#f0ffff',
    alignItems: 'center',
  },
  header: {
    marginTop: '5%',
  },
  mainContainer: {
    alignItems: 'center',
    marginTop: '10%',
    padding: '10%',
    paddingTop: '10%',
    paddingBottom: '10%',
  },
  image: {
    borderColor: 'transparent',
    alignSelf: 'center',
    opacity: 0.3,
  },
  button: {
    marginTop: '5%',
  },
  buttonText: {
    fontStyle: 'normal',
    fontSize: 15,
  },
});
