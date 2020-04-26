/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';

export default function TypeRoom({navigation, route}) {
  const {width} = useDimensions().window;
  const rooms = [
    {
      id: 1,
      room: 'Bedroom',
      uri: require('../../../assets/Rooms/bedroom.jpg'),
    },
    {
      id: 2,
      room: 'Kitchen',
      uri: require('../../../assets/Rooms/kitchen.jpg'),
    },
    {
      id: 3,
      room: 'Bathroom',
      uri: require('../../../assets/Rooms/bathroom.jpg'),
    },
    {
      id: 4,
      room: 'Living Room',
      uri: require('../../../assets/Rooms/livingroom.jpg'),
    },
    {
      id: 5,
      room: 'Dinning Room',
      uri: require('../../../assets/Rooms/dinningroom.jpg'),
    },
    {
      id: 6,
      room: "Baby's Room",
      uri: require('../../../assets/Rooms/babysroom.jpg'),
    },
    {
      id: 7,
      room: "Children's Room",
      uri: require('../../../assets/Rooms/kiddos.jpg'),
    },
    {
      id: 8,
      room: 'Backyard',
      uri: require('../../../assets/Rooms/backyard.jpg'),
    },
  ];

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AddRoom', {
          itemId: item.id,
          itemName: item.room,
        })
      }>
      <View
        style={{
          width: width * 0.45,
          alignContent: 'center',
        }}>
        <Image
          source={item.uri}
          style={{
            width: '100%',
            height: width * 0.45 * 0.682,
            alignSelf: 'center',
            backgroundColor: '#dce6e6',
          }}
          resizeMode="contain"
        />
        <Text style={styles.textStyle}>{item.room}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          Which kind of room?
        </Text>
      </View>
      <OptimizedFlatList
        style={styles.flatList}
        data={rooms}
        renderItem={renderItem}
        contentContainerStyle={styles.flatList}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ffff',
    alignItems: 'center',
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
