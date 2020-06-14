/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {imagesDevices} from '../../common/ComponentsUtils';
import {getAllData} from '../../common/Dao';

/**
 * Vista para la elección del dispositivo donde ejecutar la acción o condición.
 * Permite la elección de acciones de tipo timer.
 */
export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const {width, height} = useDimensions().window;

  useEffect(() => {
    getAllData('devices').then(value => {
      setDevices(value);
      setLoading(false);
    });
  }, []);

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}
        onPress={() => {
          navigation.navigate('RCD', {
            ...route.params,
            device: data,
          });
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
            {data.room != null ? data.room : 'No Asignado'}
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

  return (
    <View style={listStyles.container}>
      <View
        style={[
          listStyles.header,
          {
            marginTop: height * 0.05,
            marginBottom: height * 0.03,
          },
        ]}>
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>
          Selecciona una condición
        </Text>
      </View>
      <Text
        style={{fontSize: 15, fontWeight: 'bold', marginBottom: height * 0.03}}>
        {route.params.if ? 'IF...' : 'THEN...'}
      </Text>
      {!route.params.if ? (
        <View>
          <View style={listStyles.listheader}>
            <Text
              style={{
                marginLeft: '10%',
                fontSize: 10,
              }}>
              Condiciones generales
            </Text>
          </View>
          <TouchableOpacity
            style={[
              listStyles.mainContainer,
              {marginBottom: height * 0.01, width: width * 0.8},
            ]}
            onPress={() =>
              navigation.navigate('RCD', {
                ...route.params,
                device: {
                  devices: [-1],
                },
              })
            }>
            <Image
              source={imagesDevices(0)}
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
              <Text style={listStyles.name}>Esperar un tiempo</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
      <OptimizedFlatList
        style={{width: width * 0.8, marginBottom: height * 0.04}}
        data={devices}
        renderItem={({item}) => <Item data={item} />}
        containerStyle={listStyles.mainContainer}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
        ListHeaderComponent={
          <View style={listStyles.listheader}>
            <Text
              style={{
                marginLeft: '10%',
                fontSize: 10,
              }}>
              Condiciones por Módulo
            </Text>
          </View>
        }
      />
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  listheader: {
    padding: 2,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  mainContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
  },
  image: {
    alignSelf: 'center',
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

const noDeviceStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHeaderContainer: {
    padding: 5,
    paddingRight: 10,
  },
});
