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
import {getMapDevices} from '../../common/Dao';

/**
 * Vista de una regla específica.
 * Permite la creación y modificación de acciones y condiciones.
 */
export default function AddRule({navigation, route}) {
  const [isLoading, setLoading] = useState(false);
  const [devices, setDevices] = useState(new Map());
  const [measurer, setMeasurer] = useState({});
  const [actuators, setActuators] = useState([]);
  const [replace] = useState(route.params);
  const [onIf, whereAreWe] = useState(true);
  const [press, doPress] = useState({
    indicator: false,
    data: {},
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    if (replace != null) {
      setMeasurer(replace.rule.if);
      setActuators(replace.rule.then);
      whereAreWe(false);
    }
    getMapDevices().then(value => {
      setDevices(value);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (route.params != null && route.params.condition != null) {
      setLoading(true);
      if (route.params.if) {
        setMeasurer({
          id: route.params.condition.id,
          description: route.params.condition.description,
          value: route.params.condition.value,
          device: {
            deviceId: route.params.device.deviceId,
            gpio: route.params.device.gpio,
          },
        });
        whereAreWe(false);
      } else {
        var newValue = Object.assign([], actuators);
        var newActuator = {
          id: route.params.condition.id,
          description: route.params.condition.description,
          value: route.params.condition.value,
          device: {
            deviceId: route.params.device.deviceId,
            gpio: route.params.device.gpio,
          },
        };
        if (route.params.index == null) {
          newValue.push(newActuator);
        } else {
          newValue[route.params.index] = newActuator;
        }
        setActuators(newValue);
      }
      setLoading(false);
      route.params = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  useLayoutEffect(() => {
    var header = {
      headerRight: () => {
        route.params = null;
        var toAdd = false;
        if (actuators.length !== 0) {
          for (let actuator of actuators) {
            if (actuator.device.deviceId != null) {
              toAdd = true;
            }
          }
        }
        toAdd =
          toAdd &&
          measurer.id != null &&
          (replace == null ||
            (replace != null &&
              JSON.stringify({if: measurer, then: actuators}) !==
                JSON.stringify({
                  if: replace.rule.if,
                  then: replace.rule.then,
                })));
        if (toAdd) {
          return (
            <TouchableOpacity
              style={noDeviceStyles.iconHeaderContainer}
              onPress={() => {
                var toret;
                toret = {
                  rule: {if: measurer, then: actuators},
                  addIndicator: true,
                };
                if (replace != null) {
                  toret = {...toret, index: replace.index};
                }
                navigation.navigate('RM', toret);
              }}>
              <Icon name="done" size={30} />
            </TouchableOpacity>
          );
        } else {
          return null;
        }
      },
      headerLeft: () => {
        route.params = null;
        if (press.indicator) {
          return (
            <TouchableOpacity
              style={noDeviceStyles.iconHeaderContainer}
              onPress={() =>
                doPress({
                  indicator: false,
                  data: {},
                })
              }>
              <Icon name="close" size={30} />
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity
              style={noDeviceStyles.iconHeaderContainer}
              onPress={() => navigation.navigate('RM')}>
              <Icon name="arrow-left" type="material-community" />
            </TouchableOpacity>
          );
        }
      },
      headerRightContainerStyle: {marginRight: '5%'},
      headerLeftContainerStyle: {marginLeft: '5%'},
    };
    replace != null
      ? navigation.setOptions({...header, title: 'Detalle Regla'})
      : navigation.setOptions(header);
  }, [actuators, measurer, navigation, press.indicator, replace, route.params]);

  const Measurer = ({data}) => {
    if (data.id != null) {
      var device = devices.get(data.device.deviceId);
      var srcImage = imagesDevices(device.type);
      return (
        <TouchableOpacity
          style={[
            listStyles.mainContainer,
            {
              backgroundColor:
                press.indicator && press.index === 0
                  ? 'rgba(0,0,0,0.2)'
                  : 'white',
              width: width * 0.9,
            },
          ]}
          onPress={() => {
            if (replace == null) {
              doPress({indicator: true, data: data, index: 0});
            }
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
            <View
              style={[
                listStyles.devicesInfo,
                {width: width * 0.25, marginLeft: width * 0.03},
              ]}>
              <Text style={listStyles.deviceName}>{device.name}</Text>
              <Text style={listStyles.deviceRoom}>GPIO {data.device.gpio}</Text>
              <Text style={listStyles.deviceRoom}>
                {device.room != null ? device.room : 'No Asignado'}
              </Text>
            </View>
          </View>
          <Text style={listStyles.name}>:</Text>
          <View>
            <Text style={listStyles.name}>
              {data.description.replace('?', data.value)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View
          style={[
            listStyles.mainContainer,
            {
              width: width * 0.9,
            },
          ]}>
          <Text style={listStyles.name}>No existe la condición</Text>
        </View>
      );
    }
  };

  const Actuators = ({data}) => {
    return data.map((act, key) => {
      if (act.device.deviceId != null) {
        var device = devices.get(act.device.deviceId);
        var srcImage = imagesDevices(device.type);
      }
      return (
        <TouchableOpacity
          key={key}
          style={[
            listStyles.mainContainer,
            {
              backgroundColor:
                press.indicator && press.index === key + 1
                  ? 'rgba(0,0,0,0.2)'
                  : 'white',
              width: width * 0.9,
            },
          ]}
          onPress={() => {
            doPress({indicator: true, data: act, index: key + 1});
          }}>
          {act.device.deviceId != null ? (
            <View style={listStyles.deviceContainer}>
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
                <View
                  style={[
                    listStyles.devicesInfo,
                    {width: width * 0.25, marginLeft: width * 0.03},
                  ]}>
                  <Text style={listStyles.deviceName}>{device.name}</Text>
                  <Text style={listStyles.deviceRoom}>
                    GPIO {act.device.gpio}
                  </Text>
                  <Text style={listStyles.deviceRoom}>
                    {device.room != null ? device.room : 'No Asignado'}
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

  if (measurer.id == null && actuators.length === 0) {
    return (
      <View style={noDeviceStyles.container}>
        <View
          style={[
            noDeviceStyles.mainContainer,
            {
              paddingBottom: '5%',
            },
          ]}>
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
          <Button
            containerStyle={noDeviceStyles.button}
            titleStyle={noDeviceStyles.buttonText}
            type="outline"
            title="Añadir Condición"
            onPress={() => navigation.navigate('RCH', {if: onIf})}
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
        <Measurer data={measurer} />
        <Text style={listStyles.then}>Then</Text>
        <Actuators data={actuators} />
      </ScrollView>
      {!press.indicator && (
        <TouchableOpacity
          style={listStyles.addRoom}
          onPress={() => navigation.navigate('RCH', {if: onIf})}>
          <Icon name="add" type="material" color="#125c28" size={40} />
        </TouchableOpacity>
      )}
      {press.indicator && (
        <View style={[optionsMenu.container, {height: height * 0.09}]}>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              doPress({
                indicator: false,
                data: {},
              });
              navigation.navigate('RCH', {
                if: press.index === 0 ? true : false,
                replace: press.index - 1,
              });
            }}>
            <Icon name="edit" size={30} />
            <Text style={optionsMenu.text}>Reemplazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              if (press.index > 0) {
                doPress({
                  indicator: false,
                  data: {},
                });
                var array = Object.assign([], actuators);
                array.splice(press.index - 1, 1);
                setActuators(array);
              } else {
                doPress({
                  indicator: false,
                  data: {},
                });
                whereAreWe(true);
                setMeasurer({});
              }
            }}>
            <Icon name="delete" size={30} />
            <Text style={optionsMenu.text}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'center',
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
    backgroundColor: '#ffc400',
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
    justifyContent: 'center',
  },
  mainContainer: {
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

const optionsMenu = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
  },
  iconsContainer: {
    width: '18%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontStyle: 'italic',
    fontSize: 12,
    fontWeight: '400',
  },
});
