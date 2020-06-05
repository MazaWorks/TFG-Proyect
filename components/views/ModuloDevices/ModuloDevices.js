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
  Modal,
  TextInput,
} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import {imagesDevices} from '../../common/ComponentsUtils';
import ErrorResponse from '../../common/ErrorResponse';
import {
  getAllData,
  addItem,
  deleteItem,
  renameItem,
  existRuleOnDevice,
} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, getDevices] = useState([]);
  const [rename, setRename] = useState({indicator: false});
  const [modalError, setModalError] = useState({indicator: false});
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
        addItem('devices', devices, route.params.newDevices, null).then(
          value => {
            if (value != null) {
              getDevices(value);
            }
            setLoading(false);
          },
        );
        route.params = null;
      } else {
        getAllData('devices').then(value => {
          getDevices(value);
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

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
            backgroundColor:
              longPress.indicator && longPress.data.id === data.id
                ? 'rgba(0,0,0,0.2)'
                : 'white',
          },
        ]}
        onPress={() =>
          longPress.indicator ? null : navigation.navigate('DV', {device: data})
        }
        onLongPress={() => {
          doLongPress({indicator: true, data: data});
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
        <View
          style={[
            noDeviceStyles.mainContainer,
            {
              padding: height * 0.1,
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
            title="Find Modules"
            onPress={() => navigation.navigate('DS')}
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
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Module</Text>
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
      {!longPress.indicator && (
        <TouchableOpacity
          style={listStyles.addRoom}
          onPress={() => navigation.navigate('DS')}>
          <Icon name="add" type="material" color="#ffc400" size={40} />
        </TouchableOpacity>
      )}
      {longPress.indicator && (
        <View style={[optionsMenu.container, {height: height * 0.09}]}>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              setRename({indicator: true, name: longPress.data.name});
            }}>
            <Icon name="edit" size={30} />
            <Text style={optionsMenu.text}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              setLoading(true);
              existRuleOnDevice(longPress.data).then(response => {
                if (!response) {
                  var array = Object.assign([], devices);
                  deleteItem('devices', array, longPress.data).then(value => {
                    getDevices(value);
                  });
                } else {
                  setModalError({indicator: true, status: 1});
                }
                doLongPress({
                  indicator: false,
                  data: {},
                });
                setLoading(false);
              });
            }}>
            <Icon name="delete" size={30} />
            <Text style={optionsMenu.text}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rename.indicator}>
        <View style={modalStyle.modalContainer}>
          <View
            style={[
              modalStyle.modelComponentsContainer,
              {
                marginBottom: height * 0.05,
                width: width * 0.9,
              },
            ]}>
            <Text style={modalStyle.topText}>Type a new name</Text>
            <TextInput
              style={modalStyle.textInput}
              textAlign="center"
              textContentType="name"
              maxLength={12}
              onChangeText={text => setRename({indicator: true, name: text})}
              value={rename.name}
            />
            <View style={modalStyle.modalOptionsContainer}>
              <TouchableOpacity
                style={modalStyle.modalOptionCancel}
                onPress={() => {
                  setRename({indicator: false});
                }}>
                <Text style={modalStyle.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyle.modalOptionDelete}
                activeOpacity={rename.name !== longPress.data.name ? 0.2 : 1}
                onPress={() => {
                  setRename({indicator: false});
                  doLongPress({
                    indicator: false,
                    data: {},
                  });
                  if (rename.name !== longPress.data.name) {
                    var continuar = true;
                    for (let device of devices) {
                      if (device.name === rename.name) {
                        continuar = false;
                        break;
                      }
                    }
                    if (continuar) {
                      setLoading(true);
                      var array = Object.assign([], devices);
                      renameItem(
                        'devices',
                        array,
                        longPress.data,
                        rename.name,
                      ).then(value => {
                        getDevices(value);
                        setLoading(false);
                      });
                    }
                  }
                }}>
                <Text
                  style={[
                    modalStyle.textStyle,
                    {
                      color:
                        rename.name !== longPress.data.name ? 'black' : 'grey',
                    },
                  ]}>
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalError.indicator}>
        <View style={modalStyle.modalContainer}>
          <View
            style={[
              modalStyle.modelComponentsContainer,
              {
                marginBottom: height * 0.05,
                width: width * 0.9,
              },
            ]}>
            <ErrorResponse status={modalError.status} />
            <View style={modalStyle.modalOptionsContainer}>
              <TouchableOpacity
                style={modalStyle.modalOptionDelete}
                onPress={() => {
                  setModalError({
                    indicator: false,
                  });
                }}>
                <Text style={modalStyle.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1e5885',
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
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
  topText: {
    fontWeight: '800',
    fontSize: 18,
    alignSelf: 'center',
    padding: '5%',
  },
  textInput: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'grey',
    padding: 5,
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
  modalOptionCancel: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderColor: 'grey',
  },
  textStyle: {
    alignSelf: 'center',
    fontWeight: '500',
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
