/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import TextHttpResponse from '../../common/modalText/TextHttpResponse';
import {useDimensions} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getAllData, getMapDevices, addItem, deleteItem} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, setDevices] = useState(new Map());
  const [rules, setRules] = useState([]);
  const [modal, setModal] = useState({indicator: false});
  const [longPress, doLongPress] = useState({
    indicator: false,
    data: {},
  });
  const {width, height} = useDimensions().window;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      if (route.params != null && route.params.addIndicator) {
        var newActuators = [];
        for (let actuator of route.params.rule.then) {
          if (actuator.device.deviceId !== undefined) {
            if (
              devices.get(route.params.rule.if.device.deviceId).ip !==
              devices.get(actuator.device.deviceId).ip
            ) {
              newActuators.push({
                id: actuator.id,
                ip: devices.get(actuator.device.deviceId).ip,
                gpio: actuator.device.gpio,
              });
            } else {
              newActuators.push({
                id: actuator.id,
                gpio: actuator.device.gpio,
              });
            }
          } else {
            newActuators.push({timer: actuator.value});
          }
        }
        fetch(
          'http://' +
            devices.get(route.params.rule.if.device.deviceId).ip +
            '/automatize',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              if: {
                id: route.params.rule.if.id,
                ip: devices.get(route.params.rule.if.device.deviceId).ip,
                value: route.params.rule.if.value,
                gpio: route.params.rule.if.device.gpio,
              },
              then: newActuators,
            }),
          },
        )
          .then(response => {
            if (response.ok) {
              route.params.rule.active = true;
              addItem('rules', rules, route.params.rule, route.params.index)
                .then(value2 => {
                  route.params = null;
                  setModal({indicator: true, status: response.status});
                  setLoading(false);
                  setRules(value2);
                })
                .catch(() => {
                  setModal({indicator: true, status: -1});
                  setLoading(false);
                });
            } else {
              if (longPress.data.active == null) {
                route.params.rule.active = false;
                addItem('rules', rules, route.params.rule, route.params.index)
                  .then(value2 => {
                    route.params = null;
                    setRules(value2);
                    setModal({indicator: true, status: response.status});
                    setLoading(false);
                  })
                  .catch(() => {
                    setModal({indicator: true, status: -1});
                    setLoading(false);
                  });
              } else {
                setModal({indicator: true, status: response.status});
                setLoading(false);
              }
            }
          })
          .catch(() => {
            route.params.rule.active = false;
            addItem('rules', rules, route.params.rule, route.params.index)
              .then(value2 => {
                route.params = null;
                setRules(value2);
                setModal({indicator: true, status: 0});
                setLoading(false);
              })
              .catch(() => {
                setModal({indicator: true, status: -1});
                setLoading(false);
              });
          });
      } else {
        getAllData('rules')
          .then(value => {
            getMapDevices().then(value2 => {
              setDevices(value2);
              setRules(value);
              setLoading(false);
            });
          })
          .catch(() => {
            setModal({indicator: true, status: -1});
            setLoading(false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params, isFocused]);

  useLayoutEffect(() => {
    if (longPress.indicator) {
      navigation.setOptions({
        headerLeftContainerStyle: {marginLeft: '5%'},
        headerLeft: () => (
          <TouchableOpacity
            style={noDeviceStyles.iconHeaderContainer}
            onPress={() =>
              doLongPress({
                indicator: false,
                data: {},
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
      });
    }
  }, [devices, longPress, navigation]);

  const Item = ({data, index}) => {
    var deviceIf = devices.get(data.if.device.deviceId);
    var srcImageif = imagesDevices(deviceIf.type);
    if (data.then[0].device.deviceId != null) {
      var deviceThen = devices.get(data.then[0].device.deviceId);
      var srcImagethen = imagesDevices(deviceThen.type);
    }
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.9,
            backgroundColor:
              longPress.indicator && longPress.index === index
                ? 'rgba(0,0,0,0.2)'
                : data.active
                ? '#85ed8c'
                : '#e66e6e',
          },
        ]}
        onPress={() =>
          longPress.indicator
            ? null
            : navigation.navigate('RA', {
                rule: data,
                index: index,
              })
        }
        onLongPress={() => {
          doLongPress({indicator: true, data: data, index: index});
        }}>
        <View>
          <View style={listStyles.deviceContainer}>
            <Image
              source={srcImageif}
              style={[
                listStyles.image,
                {
                  width: (width * 0.8) / 8,
                  height: (width * 0.8) / 8,
                },
              ]}
              resizeMode="contain"
            />
            <View
              style={{width: (width * 0.8) / 4.5, marginLeft: width * 0.02}}>
              <Text style={listStyles.deviceName}>{deviceIf.name}</Text>
              <Text style={listStyles.deviceRoom}>
                GPIO {data.if.device.gpio}
              </Text>
              <Text style={listStyles.deviceRoom}>
                {deviceIf.room != null ? deviceIf.room : 'Not Assigned'}
              </Text>
            </View>
          </View>
          <Text style={listStyles.name}>
            {data.if.description.replace('?', data.if.value)}
          </Text>
        </View>
        <Text style={listStyles.arrow}>></Text>
        <View>
          {data.then[0].device.deviceId != null ? (
            <View style={listStyles.deviceContainer}>
              <Image
                source={srcImagethen}
                style={[
                  listStyles.image,
                  {
                    width: (width * 0.8) / 8,
                    height: (width * 0.8) / 8,
                  },
                ]}
                resizeMode="contain"
              />
              <View
                style={{width: (width * 0.8) / 4.5, marginLeft: width * 0.02}}>
                <Text style={listStyles.deviceName}>{deviceThen.name}</Text>
                <Text style={listStyles.deviceRoom}>
                  GPIO {data.then[0].device.gpio}
                </Text>
                <Text style={listStyles.deviceRoom}>
                  {deviceThen.room != null ? deviceThen.room : 'Not Assigned'}
                </Text>
              </View>
            </View>
          ) : null}
          <Text style={listStyles.name}>
            {data.then[0].description.replace('?', data.then[0].value)}
          </Text>
        </View>
        {data.then.length > 1 ? (
          <View style={{flexDirection: 'row'}}>
            <Text style={listStyles.arrow}>></Text>
            <Text style={listStyles.arrow}>...</Text>
          </View>
        ) : null}
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

  if (rules.length === 0) {
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
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Rule</Text>
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
            title="Find Modules"
            onPress={() => navigation.navigate('RA')}
          />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modal.indicator}>
          <View style={modalStyle.modalContainer}>
            <View
              style={[
                modalStyle.modelComponentsContainer,
                {
                  marginBottom: height * 0.05,
                  width: width * 0.9,
                },
              ]}>
              <TextHttpResponse status={modal.status} />
              <View style={modalStyle.modalOptionsContainer}>
                <TouchableOpacity
                  style={modalStyle.modalOptionDelete}
                  onPress={() => {
                    setModal({
                      indicator: false,
                    });
                  }}>
                  <Text style={modalStyle.textStyle}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Rule</Text>
      </View>
      <OptimizedFlatList
        style={{
          marginBottom: height * 0.04,
        }}
        data={rules}
        renderItem={({item, index}) => <Item data={item} index={index} />}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
      />
      {!longPress.indicator && (
        <TouchableOpacity
          style={listStyles.addRoom}
          onPress={() => navigation.navigate('RA')}>
          <Icon name="add" type="material" color="#125c28" size={40} />
        </TouchableOpacity>
      )}
      {longPress.indicator && (
        <View style={[optionsMenu.container, {height: height * 0.09}]}>
          {!longPress.data.active && (
            <TouchableOpacity
              style={optionsMenu.iconsContainer}
              onPress={() => {
                doLongPress({
                  indicator: false,
                  data: {},
                });
                route.params = {
                  rule: longPress.data,
                  addIndicator: true,
                  index: longPress.index,
                };
              }}>
              <Icon name="edit" size={30} />
              <Text style={optionsMenu.text}>Activate</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              doLongPress({
                indicator: false,
                data: {},
              });
              navigation.navigate('RA', {
                rule: longPress.data,
                index: longPress.index,
              });
            }}>
            <Icon name="edit" size={30} />
            <Text style={optionsMenu.text}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              setLoading(true);
              doLongPress({
                indicator: false,
                data: {},
              });
              fetch(
                'http://' +
                  devices.get(longPress.data.if.device.deviceId).ip +
                  '/automatize?id=' +
                  longPress.data.if.id +
                  '&gpio=' +
                  longPress.data.if.device.gpio +
                  '&value=' +
                  longPress.data.if.value,
                {
                  method: 'DELETE',
                },
              )
                .then(response => {
                  if (response.ok) {
                    deleteItem(
                      'rules',
                      Object.assign([], rules),
                      longPress.data,
                    )
                      .then(value => {
                        setRules(value);
                        setModal({indicator: true, status: response.status});
                        setLoading(false);
                      })
                      .catch(() => {
                        setModal({indicator: true, status: -1});
                        setLoading(false);
                      });
                  } else {
                    setModal({indicator: true, status: response.status});
                    setLoading(false);
                  }
                })
                .catch(() => {
                  setModal({indicator: true, status: 0});
                  setLoading(false);
                });
            }}>
            <Icon name="delete" size={30} />
            <Text style={optionsMenu.text}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal animationType="slide" transparent={true} visible={modal.indicator}>
        <View style={modalStyle.modalContainer}>
          <View
            style={[
              modalStyle.modelComponentsContainer,
              {
                marginBottom: height * 0.05,
                width: width * 0.9,
              },
            ]}>
            <TextHttpResponse status={modal.status} />
            <View style={modalStyle.modalOptionsContainer}>
              <TouchableOpacity
                style={modalStyle.modalOptionDelete}
                onPress={() => {
                  setModal({
                    indicator: false,
                  });
                }}>
                <Text style={modalStyle.textStyle}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modelComponentsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  modalOptionsContainer: {
    flexDirection: 'row',
  },
  modalOptionDelete: {
    flex: 1,
    padding: 10,
    borderLeftWidth: 1,
    borderColor: 'grey',
  },
  textStyle: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 15,
  },
});

const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  mainContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
  },
  deviceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
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
    alignSelf: 'center',
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
