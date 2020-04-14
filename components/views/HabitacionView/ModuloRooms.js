import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {Icon, ListItem, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {useDimensions} from '@react-native-community/hooks';
import {iconsRooms} from '../../utils/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [letDelete, onDelete] = useState({
    modal: false,
    data: {name: null, numberDevices: null},
  });
  const [rooms, getRooms] = useState([]);
  const {width} = useDimensions().window;

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
            console.log(
              'There has been a problem with your fetch operation: ' +
                error.message,
            );
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
            console.log(
              'There has been a problem with your fetch operation: ' +
                error.message,
            );
          });
      }
    }
    getData();
  }, [route.params]);

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
          bottomDivider
          chevron
          onPress={() => console.log('HE')}
          onLongPress={() => {
            onDelete({modal: true, data: data});
          }}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.listHeader}>
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
        </View>
        <View style={styles.noDeviceContainer}>
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
      <OptimizedFlatList
        style={styles.flatList}
        data={rooms}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={{fontSize: 15, fontWeight: 'bold'}}>
              Choose a Room
            </Text>
          </View>
        }
        renderItem={({item}) => <Item data={item} />}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity
        style={styles.addRoom}
        onPress={() => navigation.navigate('TypeRoom', {rooms: rooms})}>
        <Icon name="add" type="material" color="#ffc400" size={40} />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={letDelete.modal}>
        <View style={modalstyle.modalContainer}>
          <View style={modalstyle.modelComponentsContainer}>
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
                      modal: false,
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
    </View>
  );
}

const modalstyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modelComponentsContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
    marginBottom: '20%',
    width: '70%',
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  listHeader: {
    marginTop: '10%',
    marginBottom: '5%',
    alignItems: 'center',
  },
  noDeviceContainer: {
    backgroundColor: '#fff',
    padding: '10%',
    paddingTop: '5%',
    paddingBottom: '5%',
    alignItems: 'center',
  },
  noRoomButton: {
    marginTop: '5%',
  },
  noDeviceButtonText: {
    fontStyle: 'normal',
    fontSize: 15,
  },
  flatList: {
    width: '80%',
    marginBottom: '5%',
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
