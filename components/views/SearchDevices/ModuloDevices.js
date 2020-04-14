import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../utils/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, getDevices] = useState([
    {
      name: 'MedidorTemperatura',
      ip: '192.168.0.22',
      room: 'Habitacion',
      idDevice: 1,
    },
    {
      name: 'MedidorTemperatura2',
      ip: '192.168.0.22',
      room: 'Habitacion',
      idDevice: 1,
    },
  ]);

  const {width} = useDimensions().window;

  useEffect(() => {
    async function getData() {
      await AsyncStorage.getItem('devices')
        .then(value => {
          if (value != null && value !== '') {
            getDevices(JSON.parse(value));
          }
          setLoading(false);
        })
        .catch(error => {
          console.log(
            'There has been a problem with your fetch operation: ' +
              error.message,
          );
        });
    }
    getData();
  }, []);

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.idDevice);
    return (
      <TouchableOpacity
        style={[listStyles.mainContainer, {width: width * 0.8}]}
        onPress={() => navigation.navigate('DeviceView', {device: data})}>
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
          <Text style={listStyles.subtitle}>{data.room}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={listStyles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={noDeviceStyles.container}>
        <View style={noDeviceStyles.header}>
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
        </View>
        <View style={noDeviceStyles.mainContainer}>
          <Image
            source={require('../../../assets/Devices/noDevices.png')}
            style={[
              noDeviceStyles.image,
              {width: width * 0.6, height: width * 0.36},
            ]}
            resizeMode="contain"
          />
          <Button
            containerStyle={noDeviceStyles.button}
            titleStyle={noDeviceStyles.buttonText}
            type="outline"
            title="Find Devices"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={listStyles.container}>
      <OptimizedFlatList
        data={devices}
        ListHeaderComponent={
          <View style={listStyles.header}>
            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
              Choose a Device
            </Text>
          </View>
        }
        renderItem={({item}) => <Item data={item} />}
        containerStyle={listStyles.mainContainer}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
      />
      <TouchableOpacity
        style={listStyles.addRoom}
        onPress={() => navigation.navigate('SearchingDevices')}>
        <Icon name="add" type="material" color="#ffc400" size={40} />
      </TouchableOpacity>
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
  addRoom: {
    position: 'absolute',
    right: '5%',
    bottom: '5%',
    backgroundColor: '#83c965',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
  },
});

const noDeviceStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  header: {
    marginTop: '10%',
    marginBottom: '5%',
    alignItems: 'center',
  },
  mainContainer: {
    backgroundColor: '#fff',
    padding: '10%',
    paddingTop: '5%',
    paddingBottom: '5%',
    alignItems: 'center',
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
