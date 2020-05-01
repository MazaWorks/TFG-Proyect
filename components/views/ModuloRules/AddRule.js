/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {useDimensions} from '@react-native-community/hooks';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getDevicebyRule} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(false);
  const [devices, setDevices] = useState(new Map());
  const [measurer, setMeasurer] = useState({});
  const [actuators, setActuators] = useState([]);
  const [onIf, whereAreWe] = useState(true);
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    getDevicebyRule(null, true).then(value => {
      setDevices(value);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (route.params != null && route.params.condition != null) {
      setLoading(true);
      if (route.params.if) {
        setMeasurer({
          id: route.params.condition.id,
          description: route.params.condition.description,
          value: route.params.condition.value,
          deviceId: route.params.deviceId,
        });
        whereAreWe(false);
      } else {
        var newValue = Object.assign([], actuators);
        if (route.params.deviceId !== 0) {
          newValue.push({
            id: route.params.condition.id,
            description: route.params.condition.description,
            value: route.params.condition.value,
            deviceId: route.params.deviceId,
          });
        } else {
          newValue.push({
            id: route.params.condition.id,
            description: route.params.condition.description,
            value: route.params.condition.value,
          });
        }
        setActuators(newValue);
      }
      setLoading(false);
      route.params = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        var toAdd = false;
        if (actuators.length !== 0) {
          for (let actuator of actuators) {
            if (actuator.deviceId != null) {
              toAdd = true;
            }
          }
        }
        if (toAdd) {
          return (
            <TouchableOpacity
              style={noDeviceStyles.iconHeaderContainer}
              onPress={() =>
                navigation.navigate('ModuloRules', {
                  rule: {if: measurer, then: actuators},
                  addIndicator: true,
                })
              }>
              <Icon name="done" size={30} />
            </TouchableOpacity>
          );
        } else {
          return null;
        }
      },
      headerLeft: () => {
        route.params = null;
        return (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() => navigation.navigate('ModuloRules')}>
            <Icon name="arrow-left" type="material-community" />
          </TouchableOpacity>
        );
      },
      headerRightContainerStyle: {marginRight: '5%'},
      headerLeftContainerStyle: {marginLeft: '5%'},
    });
  }, [actuators, measurer, navigation, onIf, route.params]);

  const Measurer = ({measurer}) => {
    var device = devices.get(measurer.deviceId);
    var srcImage = imagesDevices(device.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}>
        <View style={listStyles.deviceContainer}>
          <Image
            source={srcImage}
            style={[
              listStyles.image,
              {
                width: (width * 0.8) / 5,
                height: (width * 0.8) / 5,
              },
            ]}
            resizeMode="contain"
          />
          <View style={[listStyles.devicesInfo, {width: width * 0.15}]}>
            <Text style={listStyles.deviceName}>{device.name}</Text>
            <Text style={listStyles.deviceRoom}>
              {device.room != null ? 'On ' + device.room : 'Not Assigned'}
            </Text>
          </View>
        </View>
        <Text style={listStyles.name}>:</Text>
        <View>
          <Text style={listStyles.name}>
            {measurer.description.replace('?', measurer.value)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Actuators = ({actuators}) => {
    return actuators.map((act, key) => {
      if (act.deviceId != null) {
        var device = devices.get(act.deviceId);
        var srcImage = imagesDevices(device.type);
      }
      return (
        <TouchableOpacity
          key={key}
          style={[
            listStyles.mainContainer,
            {
              flexDirection: act.deviceId != null ? 'row' : 'column',
              width: width * 0.8,
            },
          ]}>
          {act.deviceId != null ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={listStyles.deviceContainer}>
                <Image
                  source={srcImage}
                  style={[
                    listStyles.image,
                    {
                      width: (width * 0.8) / 5,
                      height: (width * 0.8) / 5,
                    },
                  ]}
                  resizeMode="contain"
                />
                <View style={[listStyles.devicesInfo, {width: width * 0.15}]}>
                  <Text style={listStyles.deviceName}>{device.name}</Text>
                  <Text style={listStyles.deviceRoom}>
                    {device.room != null ? 'On ' + device.room : 'Not Assigned'}
                  </Text>
                </View>
              </View>
              <Text style={listStyles.name}>:</Text>
            </View>
          ) : null}
          <View style={{alignSelf: 'center'}}>
            <Text style={listStyles.name}>
              {act.description.replace('?', act.value)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
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

  if (onIf) {
    return (
      <View style={noDeviceStyles.container}>
        <View
          style={[
            noDeviceStyles.mainContainer,
            {
              padding: '10%',
              paddingTop: '5%',
              paddingBottom: '5%',
              marginTop: height * 0.15,
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
            title="Add a Clause"
            onPress={() => navigation.navigate('ChooseClause', {if: onIf})}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={listStyles.container}>
      <ScrollView>
        <Text
          style={[
            listStyles.if,
            {
              marginTop: height * 0.05,
            },
          ]}>
          If
        </Text>
        <Measurer measurer={measurer} />
        <Text style={listStyles.then}>Then</Text>
        <Actuators actuators={actuators} />
      </ScrollView>
      <TouchableOpacity
        style={listStyles.addRoom}
        onPress={() => navigation.navigate('ChooseClause', {if: onIf})}>
        <Icon name="add" type="material" color="#ffc400" size={40} />
      </TouchableOpacity>
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  mainContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
  },
  if: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  then: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  deviceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  devicesInfo: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  deviceName: {
    fontSize: 9,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  deviceRoom: {
    fontSize: 8,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    margin: 10,
  },
  arrow: {
    margin: 5,
    fontSize: 25,
    fontWeight: 'bold',
  },
  addRoom: {
    position: 'absolute',
    right: '5%',
    bottom: '5%',
    backgroundColor: '#83c965',
    padding: 8,
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
