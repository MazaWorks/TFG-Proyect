/* eslint-disable react-native/no-inline-styles */
import React, {useState, useLayoutEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {Icon} from 'react-native-elements';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {CircleSnail} from 'react-native-progress';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../common/ComponentsUtils';
import dgram from 'dgram';

export default function SearchingDevices({navigation}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const {width, height} = useDimensions().window;

  function toByteArray(obj) {
    var uint = new Uint8Array(obj.length);
    for (var i = 0, l = obj.length; i < l; i++) {
      uint[i] = obj.charCodeAt(i);
    }
    return new Uint8Array(uint);
  }

  useLayoutEffect(() => {
    if (devices.length !== 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
            onPress={() => {
              navigation.navigate('Devices', {
                newDevices: devices,
                addIndicator: true,
              });
            }}>
            <Icon name="done" size={30} />
          </TouchableOpacity>
        ),
        headerRightContainerStyle: {marginRight: '5%'},
      });
    }
  }, [devices, navigation]);

  const renderItem = ({item}) => {
    var srcImage = imagesDevices(item.idDevice);
    return (
      <TouchableOpacity>
        <View
          style={{
            width: (width * 0.9) / 3,
            alignContent: 'center',
          }}>
          <Image
            source={srcImage}
            style={{
              width: '100%',
              height: (width * 0.9) / 3,
              alignSelf: 'center',
              backgroundColor: '#dce6e6',
            }}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>{item.ip}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    var devicesFound = [];
    var socket = dgram.createSocket('udp4');
    socket.bind();

    socket.once('listening', function() {
      var msg = toByteArray('?');
      socket.send(msg, 0, msg.length, 8080, '192.168.0.255');
      socket.send(msg, 0, msg.length, 8080, '192.168.0.255');
    });

    socket.on('message', function(data, rinfo) {
      var add = true;
      for (let dev of devicesFound) {
        if (dev.ip === rinfo.address) {
          add = false;
          break;
        }
      }
      if (add) {
        devicesFound.push({
          name: 'MedidorTemperatura',
          ip: rinfo.address,
          room: 'Bedroom',
          idDevice: JSON.parse(
            String.fromCharCode.apply(null, new Uint8Array(data)),
          ).idDevice,
        });
      }
    });

    const interval = setInterval(() => {
      socket.close();
      clearInterval(interval);
      setLoading(false);
      setDevices(devicesFound);
    }, 2000);

    return (
      <View style={styles.container}>
        <CircleSnail
          size={100}
          duration={5000}
          spinDuration={1000}
          strokeCap={'round'}
        />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[notFoundStyles.text1, {marginBottom: height * 0.05}]}>
          No devices found
        </Text>
        <Text style={notFoundStyles.text2}>Make sure you are connected </Text>
        <Text style={notFoundStyles.text2}>
          to the same network as the devices
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.listHeader,
          {
            marginTop: height * 0.1,
            marginBottom: height * 0.05,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Devices Found</Text>
      </View>
      <OptimizedFlatList
        style={styles.flatList}
        data={devices}
        renderItem={renderItem}
        contentContainerStyle={styles.flatList}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    marginTop: '5%',
    marginBottom: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    marginBottom: '5%',
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
  text1: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text2: {
    fontSize: 15,
    fontStyle: 'italic',
  },
});
