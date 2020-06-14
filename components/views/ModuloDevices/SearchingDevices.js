/* eslint-disable react-native/no-inline-styles */
import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../common/ComponentsUtils';
import {nameDefaultDevices} from '../../common/ComponentsUtils';
import dgram from 'dgram';
import {NetworkInfo} from 'react-native-network-info';

/**
 * Vista en la que se buscan los módulos activos en la red.
 * Se muestran los módulos encontrados
 */
export default function SearchingDevices({navigation}) {
  const [devices, setDevices] = useState(new Set());
  const {width, height} = useDimensions().window;
  const toByteArray = obj => {
    var uint = new Uint8Array(obj.length);
    for (var i = 0, l = obj.length; i < l; i++) {
      uint[i] = obj.charCodeAt(i);
    }
    return new Uint8Array(uint);
  };

  useEffect(() => {
    var newSocket = dgram.createSocket('udp4');
    var msg = toByteArray('?');
    newSocket.bind();
    var intervalo = 0;

    NetworkInfo.getIPV4Address().then(ipv4Address => {
      NetworkInfo.getSubnet().then(subnet => {
        var subnetArray = subnet.split('.');
        var IPArray = ipv4Address.split('.');
        for (let i = 0; i < 4; i++) {
          if (subnetArray[i] === '0') {
            while (i < 4) {
              IPArray[i] = '255';
              i++;
            }
            break;
          }
        }

        newSocket.once('listening', function() {
          newSocket.send(msg, 0, msg.length, 8080, IPArray.join('.'));
          newSocket.send(msg, 0, msg.length, 8080, IPArray.join('.'));
        });

        newSocket.on('message', function(data, rinfo) {
          var json = JSON.parse(
            String.fromCharCode.apply(null, new Uint8Array(data)),
          );
          setDevices(
            devices =>
              new Set([
                ...devices.add(
                  JSON.stringify({
                    ...json,
                    ip: rinfo.address,
                    name: nameDefaultDevices(json.type),
                  }),
                ),
              ]),
          );
        });

        intervalo = setInterval(() => {
          newSocket.send(msg, 0, msg.length, 8080, IPArray.join('.'));
        }, 10000);
      });
    });

    return () => {
      clearInterval(intervalo);
      newSocket.close();
    };
  }, []);

  useLayoutEffect(() => {
    if (devices.size !== 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
            onPress={() => {
              var devicesSent = [];
              for (let device of devices) {
                devicesSent.push(JSON.parse(device));
              }
              navigation.navigate('DM', {
                newDevices: devicesSent,
                addIndicator: true,
              });
            }}>
            <Icon name="done" size={30} />
          </TouchableOpacity>
        ),
        headerRightContainerStyle: {marginRight: '5%'},
      });
    }
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.iconHeaderContainer}
          onPress={() => {
            navigation.navigate('DM');
          }}>
          <Icon name="arrow-left" type="material-community" />
        </TouchableOpacity>
      ),
    });
  }, [devices, navigation]);

  const renderItem = ({item}) => {
    var itemJson = JSON.parse(item);
    var srcImage = imagesDevices(itemJson.type);
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
          <Text style={styles.textStyle}>{itemJson.ip}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (devices.size === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 100}
          color="#0000ff"
        />
        <Text
          style={[
            notFoundStyles.text1,
            {marginTop: height * 0.03, marginBottom: height * 0.03},
          ]}>
          Buscando ...
        </Text>
        <Text style={notFoundStyles.text2}>Asegúrate de estar conectado</Text>
        <Text style={notFoundStyles.text2}>a la misma red que los módulos</Text>
        <Text style={notFoundStyles.text2}>y que estén online y activos</Text>
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
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          Módulos Encontrados
        </Text>
      </View>
      <OptimizedFlatList
        style={styles.flatList}
        data={Array.from(devices)}
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
