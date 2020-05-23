/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getDevicesExceptRoom, addDeviceToRoom} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, getDevices] = useState([]);
  const [press, onPress] = useState({
    indicator: false,
    data: [],
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    getDevicesExceptRoom(route.params.data.name).then(value => {
      getDevices(value);
      setLoading(false);
    });
  }, [route.params.data.name]);

  useLayoutEffect(() => {
    if (press.indicator && press.data.length !== 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() => {
              addDeviceToRoom(route.params.data, press.data).then(() => {
                navigation.navigate('ROH', {addIndicator: false});
              });
            }}>
            <Icon name="add" size={30} />
          </TouchableOpacity>
        ),
        headerRightContainerStyle: {marginRight: '5%'},
      });
    } else {
      navigation.setOptions({
        title: 'Assign to ' + route.params.data.name,
        headerRight: () => null,
      });
    }
  });

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
            {data.room != null ? data.room : 'Not Assigned'}
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

  if (devices.length === 0) {
    return (
      <View style={noDeviceStyles.container}>
        <View style={noDeviceStyles.mainContainer}>
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
          <View style={noDeviceStyles.header}>
            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
              No Device Available
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={listStyles.container}>
      <View
        style={[
          listStyles.header,
          {
            marginTop: height * 0.1,
            marginBottom: height * 0.05,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          Choose the devices to move to
        </Text>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          {route.params.data.name}
        </Text>
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
    marginTop: '5%',
  },
  mainContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: '30%',
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
