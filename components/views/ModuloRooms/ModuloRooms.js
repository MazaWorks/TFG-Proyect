/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from 'react-native';
import {Icon, ListItem, Button} from 'react-native-elements';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions, useKeyboard} from '@react-native-community/hooks';
import {useIsFocused} from '@react-navigation/native';
import {iconsRooms} from '../../common/ComponentsUtils';
import {getAllData, addItem, deleteItem, renameItem} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [rename, setRename] = useState({indicator: false});
  const [longPress, doLongPress] = useState({
    indicator: false,
    data: {},
  });
  const [rooms, getRooms] = useState([]);
  const {width, height} = useDimensions().window;
  const keyboard = useKeyboard();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      if (route.params != null && route.params.addIndicator) {
        addItem('rooms', rooms, route.params.newRooms).then(value => {
          getRooms(value);
          setLoading(false);
        });
        route.params = null;
      } else {
        getAllData('rooms').then(value => {
          getRooms(value);
          setLoading(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params, isFocused]);

  useLayoutEffect(() => {
    if (!longPress.indicator) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
            onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} />
          </TouchableOpacity>
        ),
        headerLeftContainerStyle: {
          marginLeft: '5%',
        },
      });
    } else {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
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
    }
  }, [longPress, navigation, rooms]);

  const Item = ({data}) => {
    var icon = iconsRooms(data.idRoom);
    return (
      <TouchableOpacity>
        <ListItem
          roundAvatar
          title={data.name}
          titleStyle={listStyles.roomName}
          subtitle={`Number of Devices ${data.numberDevices}`}
          subtitleStyle={listStyles.numberDevices}
          leftElement={
            <View style={listStyles.iconRoom}>
              <Icon name={icon.icon_name} type={icon.type} color="#4bab22" />
            </View>
          }
          containerStyle={{
            backgroundColor:
              longPress.indicator && longPress.data.name === data.name
                ? 'rgba(0,0,0,0.3)'
                : 'white',
          }}
          bottomDivider
          chevron
          onPress={() =>
            longPress.indicator
              ? null
              : navigation.navigate('RoomView', {data: data})
          }
          onLongPress={() => {
            doLongPress({indicator: true, data: data});
          }}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 90}
          color="#0000ff"
        />
      </View>
    );
  }
  if (rooms.length === 0) {
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
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
        </View>
        <View
          style={[
            styles.noDeviceContainer,
            {
              padding: width * 0.1,
              paddingTop: width * 0.05,
              paddingBottom: width * 0.05,
            },
          ]}>
          <Image
            source={require('../../../assets/Rooms/noRooms.png')}
            style={{
              width: width * 0.6,
              height: width * 0.36,
              borderColor: 'transparent',
              alignSelf: 'center',
              opacity: 0.3,
            }}
            resizeMode="contain"
          />
          <Button
            containerStyle={styles.noRoomButton}
            titleStyle={styles.noDeviceButtonText}
            type="outline"
            title="Let's add rooms"
            onPress={() => navigation.navigate('TypeRoom', {rooms: rooms})}
          />
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
            marginTop: height * 0.1,
            marginBottom: height * 0.05,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
      </View>
      <OptimizedFlatList
        style={{
          width: '80%',
          marginBottom: longPress.indicator ? height * 0.1 : height * 0.04,
        }}
        data={rooms}
        renderItem={({item}) => <Item data={item} />}
        keyExtractor={(item, index) => index.toString()}
        removeClippedSubviews={true}
      />
      {!longPress.indicator && (
        <TouchableOpacity
          style={styles.addRoom}
          onPress={() => navigation.navigate('TypeRoom')}>
          <Icon name="add" type="material" color="#ffc400" size={40} />
        </TouchableOpacity>
      )}
      {longPress.indicator && (
        <View style={[optionsMenu.container, {height: height * 0.09}]}>
          <TouchableOpacity
            style={optionsMenu.iconsContainer}
            onPress={() => {
              navigation.navigate('AddDevice', {data: longPress.data});
              doLongPress({
                indicator: false,
                data: {},
              });
            }}>
            <Icon name="devices" size={30} />
            <Text style={optionsMenu.text}>Add Device</Text>
          </TouchableOpacity>
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
              var array = Object.assign([], rooms);
              deleteItem('rooms', array, longPress.data).then(value => {
                getRooms(value);
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
                marginBottom: keyboard.keyboardShown
                  ? height * 0.05
                  : height * 0.2,
                width: width * 0.9,
              },
            ]}>
            <Text style={modalStyle.topText}>Type a new name</Text>
            <TextInput
              style={modalStyle.textInput}
              textAlign="center"
              textContentType="name"
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
                    for (let room of rooms) {
                      if (room.name === rename.name) {
                        continuar = false;
                        break;
                      }
                    }
                    if (continuar) {
                      setLoading(true);
                      var array = Object.assign([], rooms);
                      renameItem(
                        'rooms',
                        array,
                        longPress.data,
                        rename.name,
                      ).then(value => {
                        getRooms(value);
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

const listStyles = StyleSheet.create({
  iconRoom: {
    marginRight: '5%',
  },
  roomName: {
    fontWeight: '400',
    fontSize: 13,
  },
  numberDevices: {
    fontStyle: 'italic',
    fontSize: 10,
  },
});

const styles = StyleSheet.create({
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
  listHeader: {
    alignItems: 'center',
  },
  noDeviceContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  noRoomButton: {
    marginTop: '5%',
  },
  noDeviceButtonText: {
    fontStyle: 'normal',
    fontSize: 15,
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