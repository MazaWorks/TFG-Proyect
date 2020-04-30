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
import {getAllData} from '../../common/Dao';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(false);
  const [measurer, setMeasurer] = useState({});
  const [actuators, setActuators] = useState([]);
  const [onIf, whereAreWe] = useState(true);
  const {width, height} = useDimensions().window;

  useEffect(() => {
    if (route.params != null && route.params.condition != null) {
      setLoading(true);
      if (route.params.if) {
        setMeasurer({
          device: {
            id: route.params.device.id,
            type: route.params.device.type,
            name: route.params.device.name,
            room: route.params.device.room,
          },
          rule: {
            id: route.params.condition.id,
            description: route.params.condition.description,
            value: route.params.condition.value,
          },
        });
        whereAreWe(false);
      } else {
        var newValue = Object.assign([], actuators);
        newValue.push({
          device: {
            id: route.params.device.id,
            type: route.params.device.type,
            name: route.params.device.name,
            room: route.params.device.room,
          },
          rule: {
            id: route.params.condition.id,
            description: route.params.condition.description,
            value: route.params.condition.value,
          },
        });
        setActuators(newValue);
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={noDeviceStyles.iconHeaderContainer}
          onPress={() => navigation.navigate('ChooseDevice', {if: onIf})}>
          <Icon name="add" size={30} />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {marginRight: '5%'},
    });
  }, [navigation, onIf]);

  const Measurer = ({measurer}) => {
    var srcImage = imagesDevices(measurer.device.type);
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}>
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
          <View style={[listStyles.devicesInfo, {width: width * 0.15}]}>
            <Text style={listStyles.deviceName}>{measurer.device.name}</Text>
            <Text style={listStyles.deviceRoom}>On {measurer.device.room}</Text>
          </View>
        </View>
        <Text style={listStyles.name}>:</Text>
        <View>
          <Text style={listStyles.name}>
            {measurer.rule.description.replace('?', measurer.rule.value)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Actuators = ({actuators}) => {
    return actuators.map((act, key) => {
      if (act.device != null) {
        var srcImage = imagesDevices(act.device.type);
      }
      return (
        <TouchableOpacity
          key={key}
          style={[
            listStyles.mainContainer,
            {
              flexDirection: act.device != null ? 'row' : 'column',
              width: width * 0.8,
            },
          ]}>
          {act.device != null ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
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
                <View style={[listStyles.devicesInfo, {width: width * 0.15}]}>
                  <Text style={listStyles.deviceName}>{act.device.name}</Text>
                  <Text style={listStyles.deviceRoom}>
                    On {act.device.room}
                  </Text>
                </View>
              </View>
              <Text style={listStyles.name}>:</Text>
            </View>
          ) : null}
          <View style={{alignSelf: 'center'}}>
            <Text style={listStyles.name}>
              {act.rule.description.replace('?', act.rule.value)}
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

  if (measurer.rule == null) {
    return (
      <View style={noDeviceStyles.container}>
        <View
          style={[
            noDeviceStyles.mainContainer,
            {
              padding: '10%',
              paddingTop: '5%',
              paddingBottom: '5%',
              marginTop: height * 0.15,
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
            title="Add a Clause"
            onPress={() => navigation.navigate('ChooseDevice', {if: onIf})}
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
        <Measurer measurer={measurer} />
        <Text style={listStyles.then}>Then</Text>
        <Actuators actuators={actuators} />
      </ScrollView>
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
    alignItems: 'center',
    padding: 10,
    paddingLeft: 0,
    borderWidth: 1,
    borderColor: 'lightgrey',
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
