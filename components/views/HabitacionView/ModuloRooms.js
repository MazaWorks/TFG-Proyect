/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {Icon, ListItem, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {iconsRooms} from '../../utils/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [letDelete, onDelete] = useState({
    indicator: false,
    data: {name: null, numberDevices: null},
  });
  const [rooms, getRooms] = useState([]);
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    async function getData() {
      if (route.params != null && route.params.addIndicator) {
        await AsyncStorage.setItem(
          'rooms',
          JSON.stringify(route.params.newRooms),
        )
          .then(() => {
            getRooms(route.params.newRooms);
            setLoading(false);
          })
          .catch(error => {
            console.log('Error: ' + error.message);
          });
      } else {
        await AsyncStorage.getItem('rooms')
          .then(value => {
            if (value != null && value !== '') {
              getRooms(JSON.parse(value));
            }
            setLoading(false);
          })
          .catch(error => {
            console.log('Error: ' + error.message);
          });
      }
    }
    getData();
  }, [route.params]);

  React.useLayoutEffect(() => {
    if (letDelete.indicator) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
            onPress={() => {
              var newValue = Object.assign([], rooms);
              var index = rooms.indexOf(letDelete.data);
              if (index >= 0) {
                newValue.splice(index, 1);
                try {
                  AsyncStorage.setItem('rooms', JSON.stringify(newValue));
                } catch (error) {
                  console.log(error);
                }
              }
              getRooms(newValue);
              onDelete({
                indicator: false,
                data: {name: null, numberDevices: null},
              });
            }}>
            <Icon name="delete" size={30} />
          </TouchableOpacity>
        ),
        headerRightContainerStyle: {marginRight: '5%'},
        headerLeft: () => (
          <TouchableOpacity
            style={styles.iconHeaderContainer}
            onPress={() =>
              onDelete({
                indicator: false,
                data: {name: null, numberDevices: null},
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
            style={styles.iconHeaderContainer}
            onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} />
          </TouchableOpacity>
        ),
        headerLeftContainerStyle: {
          marginLeft: '5%',
        },
        headerRight: () => null,
      });
    }
  }, [letDelete, navigation, rooms]);

  const Item = ({data}) => {
    var icon = iconsRooms(data.idRoom);
    return (
      <TouchableOpacity>
        <ListItem
          roundAvatar
          title={data.name}
          titleStyle={styles.roomName}
          subtitle={`Number of Devices ${data.numberDevices}`}
          subtitleStyle={styles.numberDevices}
          leftElement={
            <View style={styles.iconRoom}>
              <Icon name={icon.icon_name} type={icon.type} color="#4bab22" />
            </View>
          }
          containerStyle={{
            backgroundColor:
              letDelete.indicator && letDelete.data.name === data.name
                ? 'rgba(0,0,0,0.3)'
                : 'white',
          }}
          bottomDivider
          chevron
          onPress={() =>
            letDelete.indicator
              ? null
              : navigation.navigate('RoomView', {data: data})
          }
          onLongPress={() => {
            onDelete({indicator: true, data: data});
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
          marginBottom: height * 0.04,
        }}
        data={rooms}
        renderItem={({item}) => <Item data={item} />}
        keyExtractor={(item, index) => index.toString()}
        removeClippedSubviews={true}
      />
      <TouchableOpacity
        style={styles.addRoom}
        onPress={() => navigation.navigate('TypeRoom', {rooms: rooms})}>
        <Icon name="add" type="material" color="#ffc400" size={40} />
      </TouchableOpacity>
    </View>
  );
}

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
/*
      <Modal animationType="slide" transparent={true} visible={letDelete.modal}>
        <View style={modalstyle.modalContainer}>
          <View
            style={[
              modalstyle.modelComponentsContainer,
              {
                marginBottom: height * 0.05,
                width: width * 0.7,
              },
            ]}>
            <Text style={modalstyle.textStyle}>
              Name: {letDelete.data.name}
            </Text>
            <Text style={modalstyle.textStyle}>
              Devices: {letDelete.data.numberDevices}
            </Text>
            <View style={modalstyle.modalOptionsContainer}>
              <TouchableOpacity>
                <Button
                  titleStyle={modalstyle.textStyle}
                  type="outline"
                  title="Cancel"
                  buttonStyle={modalstyle.modalOptionCancel}
                  onPress={() => {
                    onDelete({
                      indicator: false,
                      data: {name: null, numberDevices: null},
                    });
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={modalstyle.modalOptionDelete}>
                <Button
                  titleStyle={modalstyle.textStyle}
                  buttonStyle={modalstyle.modalOptionDelete}
                  type="solid"
                  title="Continue"
                  onPress={() => {
                    var newValue = Object.assign([], rooms);
                    var index = rooms.indexOf(letDelete.data);
                    if (index >= 0) {
                      newValue.splice(index, 1);
                      try {
                        AsyncStorage.setItem('rooms', JSON.stringify(newValue));
                      } catch (error) {
                        console.log(error);
                      }
                    }
                    getRooms(newValue);
                    onDelete({
                      modal: false,
                      data: {name: null, numberDevices: null},
                    });
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
const modalstyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modelComponentsContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
  },
  modalOptionsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalOptionCancel: {
    marginRight: 10,
  },
  textStyle: {
    fontWeight: '500',
    fontSize: 15,
  },
});*/
