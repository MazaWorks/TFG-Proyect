/* eslint-disable react-native/no-inline-styles */
import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {useDimensions} from '@react-native-community/hooks';
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {imagesDevices} from '../../common/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(false);
  const [rules, getRules] = useState([
    {
      if: {
        device: {id: 1, type: 1, name: 'Medidor', room: 'Bedroom'},
        rule: {id: 1, description: 'More than ?º', value: 22},
      },
      then: [
        {
          device: {id: 2, type: 1, name: 'Calefactor_2', room: 'Bedroom'},
          rule: {id: 1, description: 'Turn ?', value: 'On'},
        },
        {
          rule: {id: 0, description: 'Wait ?minutes', value: 20},
        },
        {
          device: {id: 2, type: 1, name: 'Calefactor_3', room: 'Bedroom'},
          rule: {id: 1, description: 'Turn ?', value: 'Off'},
        },
      ],
    },
  ]);
  const {width, height} = useDimensions().window;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={noDeviceStyles.iconHeaderContainer}
          onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} />
        </TouchableOpacity>
      ),
    });
  });

  const Item = ({data}) => {
    var srcImage = imagesDevices(data.if.device.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}
        onPress={() => navigation.navigate('RuleView', {data: data})}>
        <View>
          <View style={listStyles.deviceContainer}>
            <Image
              source={srcImage}
              style={[
                listStyles.image,
                {
                  width: (width * 0.8) / 8,
                  height: (width * 0.8) / 8,
                },
              ]}
              resizeMode="contain"
            />
            <View style={{width: (width * 0.8) / 5}}>
              <Text style={listStyles.deviceName}>{data.if.device.name}</Text>
              <Text style={listStyles.deviceRoom}>
                On {data.if.device.room}
              </Text>
            </View>
          </View>
          <Text style={listStyles.name}>
            {data.if.rule.description.replace('?', data.if.rule.value)}
          </Text>
        </View>
        <Text style={listStyles.arrow}>></Text>
        <View>
          {data.then[0].device != null ? (
            <View style={listStyles.deviceContainer}>
              <Image
                source={srcImage}
                style={[
                  listStyles.image,
                  {
                    width: (width * 0.8) / 8,
                    height: (width * 0.8) / 8,
                  },
                ]}
                resizeMode="contain"
              />
              <View style={{width: (width * 0.8) / 5}}>
                <Text style={listStyles.deviceName}>
                  {data.then[0].device.name}
                </Text>
                <Text style={listStyles.deviceRoom}>
                  On {data.then[0].device.room}
                </Text>
              </View>
            </View>
          ) : null}
          <Text style={listStyles.name}>
            {data.then[0].rule.description.replace(
              '?',
              data.then[0].rule.value,
            )}
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
          <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Room</Text>
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
            title="Find Devices"
            onPress={() => navigation.navigate('RuleView')}
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
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Edit a Rule</Text>
      </View>
      <OptimizedFlatList
        style={{
          width: width * 0.8,
          marginBottom: height * 0.04,
        }}
        data={rules}
        renderItem={({item}) => <Item data={item} />}
        containerStyle={listStyles.mainContainer}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
      />
      <TouchableOpacity
        style={listStyles.addRoom}
        onPress={() => navigation.navigate('AddRule')}>
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
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
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
    backgroundColor: '#83c965',
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
