/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../utils/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, getDevices] = useState([]);
  const [letDelete, onDelete] = useState({
    deleteIndicator: false,
    data: {name: null, numberDevices: null},
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    async function getData() {
      if (route.params != null && route.params.addIndicator) {
        await AsyncStorage.setItem(
          'devices',
          JSON.stringify(route.params.newDevices),
        )
          .then(() => {
            getDevices(route.params.newDevices);
            setLoading(false);
          })
          .catch(error => {
            console.log('Error: ' + error.message);
          });
      } else {
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
    }
    getData();
  }, [route.params]);

  React.useLayoutEffect(() => {
    if (letDelete.deleteIndicator) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() => {
              var newValue = Object.assign([], devices);
              var index = devices.indexOf(letDelete.data);
              if (index >= 0) {
                newValue.splice(index, 1);
                try {
                  AsyncStorage.setItem('devices', JSON.stringify(newValue));
                } catch (error) {
                  console.log(error);
                }
              }
              getDevices(newValue);
              onDelete({
                deleteIndicator: false,
                data: {name: null, numberDevices: null},
              });
            }}>
            <Icon name="delete" size={30} />
          </TouchableOpacity>
        ),
        headerRightContainerStyle: {marginRight: '5%'},
        headerLeftContainerStyle: {marginLeft: '5%'},
        headerLeft: () => (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() =>
              onDelete({
                deleteIndicator: false,
                data: {name: null, numberDevices: null},
              })
            }>
            <Icon name="close" size={30} />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} />
          </TouchableOpacity>
        ),
        headerRight: () => null,
      });
    }
  }, [devices, letDelete, navigation]);

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.idDevice);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
            backgroundColor:
              letDelete.deleteIndicator && letDelete.data.ip === data.ip
                ? 'rgba(0,0,0,0.2)'
                : 'white',
          },
        ]}
        onPress={() =>
          letDelete.deleteIndicator
            ? null
            : navigation.navigate('DeviceView', {device: data})
        }
        onLongPress={() => {
          onDelete({deleteIndicator: true, data: data});
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
          <Text style={listStyles.subtitle}>{data.room}</Text>
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

  if (devices.length === 0) {
    return (
      <View style={noDeviceStyles.container}>
        <View
          style={[
            noDeviceStyles.header,
            {
              marginTop: height * 0.1,
              marginBottom: height * 0.05,
            },
          ]}>
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
        </View>
        <View
          style={[
            noDeviceStyles.mainContainer,
            {
              padding: '10%',
              paddingTop: '5%',
              paddingBottom: '5%',
            },
          ]}>
          <Image
            source={require('../../../assets/Devices/noDevices.png')}
            style={[
              noDeviceStyles.image,
              {
                width: width * 0.6,
                height: width * 0.36,
              },
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
      <View
        style={[
          noDeviceStyles.header,
          {
            marginTop: height * 0.1,
            marginBottom: height * 0.05,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Device</Text>
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
      <TouchableOpacity
        style={listStyles.addRoom}
        onPress={() =>
          navigation.navigate('SearchingDevices', {devices: devices})
        }>
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
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  mainContainer: {
    backgroundColor: '#fff',
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
