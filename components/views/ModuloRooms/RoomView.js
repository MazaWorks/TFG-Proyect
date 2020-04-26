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
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getDevicesbyRoom} from '../../common/Dao';

export default function RoomView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    getDevicesbyRoom(route.params.data.name).then(value => {
      setDevices(value);
      setLoading(false);
    });
  }, [route.params.data.name]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.data.name,
    });
  });

  const renderItem = ({item}) => {
    var srcImage = imagesDevices(item.idDevice);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('DeviceView', {device: item})}>
        <View>
          <Image
            source={srcImage}
            style={{
              width: (width * 0.9) / 3,
              height: (width * 0.9) / 3,
              alignSelf: 'center',
              backgroundColor: '#dce6e6',
            }}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.noDevicesContainer}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 90}
          color="#0000ff"
        />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.listHeader,
            {
              width: '100%',
              height: height * 0.3,
            },
          ]}>
          <Image
            source={require('../../../assets/Rooms/roomViewTop.png')}
            style={{
              width: '100%',
              height: '110%',
              alignSelf: 'center',
              opacity: 0.2,
            }}
            resizeMode="contain"
          />
        </View>
        <View style={notFoundStyles.textContainer}>
          <Text style={notFoundStyles.text1}>No devices on this room</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.listHeader,
          {
            width: '100%',
            height: height * 0.3,
          },
        ]}>
        <Image
          source={require('../../../assets/Rooms/roomViewTop.png')}
          style={{
            width: '100%',
            height: '110%',
            alignSelf: 'center',
            opacity: 0.2,
          }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.flatList}>
        <OptimizedFlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  noDevicesContainer: {
    flex: 1,
    backgroundColor: '#f0ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0ffff',
  },
  listHeader: {
    backgroundColor: 'rgba(10,74,29,0.9)',
  },
  flatList: {
    alignItems: 'center',
    marginBottom: '5%',
    marginTop: '5%',
    paddingBottom: '1%',
  },
  textStyle: {
    padding: '2%',
    marginBottom: '1%',
    fontSize: 13,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

const notFoundStyles = StyleSheet.create({
  textContainer: {
    height: '60%',
    justifyContent: 'center',
  },
  text1: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
