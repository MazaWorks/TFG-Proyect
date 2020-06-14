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
import {imagesDevices, roomsTop} from '../../common/ComponentsUtils';
import {getDevicesbyRoom} from '../../common/Dao';

/**
 * Vista de habitación. Muestra los módulos asociados a esta
 */
export default function RoomView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [topView] = useState(roomsTop(route.params.data.idRoom));
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
      headerTitleStyle: {
        color: 'black',
      },
    });
  });

  const renderItem = ({item}) => {
    var srcImage = imagesDevices(item.type);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('RODV', {device: item})}>
        <View>
          <Image
            source={srcImage}
            style={{
              width: (width * 0.9) / 3,
              height: (width * 0.9) / 3,
              alignSelf: 'center',
              backgroundColor: 'white',
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
          style={{
            width: '100%',
            height: height * 0.3,
            borderBottomWidth: 1,
            borderColor: 'gainsboro',
            backgroundColor: topView.color,
          }}>
          <Image
            source={topView.image}
            style={{
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              opacity: 0.3,
            }}
            resizeMode="contain"
          />
        </View>
        <View style={notFoundStyles.textContainer}>
          <Text style={notFoundStyles.text1}>No hay módulos asociados</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          width: '100%',
          height: height * 0.3,
          borderBottomWidth: 1,
          borderColor: 'gainsboro',
          backgroundColor: topView.color,
        }}>
        <Image
          source={topView.image}
          style={{
            width: '100%',
            height: '100%',
            alignSelf: 'center',
            opacity: 0.3,
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
  flatList: {
    alignItems: 'center',
    marginBottom: '5%',
    marginTop: '5%',
    paddingBottom: '1%',
  },
  textStyle: {
    padding: '2%',
    marginBottom: '1%',
    fontSize: 11,
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
