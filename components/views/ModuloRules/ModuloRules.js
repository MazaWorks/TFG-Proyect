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

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(false);
  const [rules, getRules] = useState([
    {
      if: {device: 1, id: 1, description: 'More than ?º', value: 22},
      then: {device: 1, id: 1, description: 'Turn ?', value: 'On'},
    },
    {
      if: {device: 1, id: 2, description: 'Less than ?º', value: 24},
      then: {device: 1, id: 2, description: 'Turn ?', value: 'Off'},
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
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}>
        <Text style={listStyles.name}>
          if "{data.if.description.replace('?', data.if.value)}" then "
          {data.then.description.replace('?', data.then.value)}"
        </Text>
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
            onPress={() => navigation.navigate('SearchingDevices')}
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
        <Text style={{fontSize: 15, fontWeight: 'bold'}}>Choose a Device</Text>
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
    padding: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
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
