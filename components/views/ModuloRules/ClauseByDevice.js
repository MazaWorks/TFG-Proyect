/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';
import {devicesRules} from '../../common/ComponentsUtils';
import {ScrollView} from 'react-native-gesture-handler';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [conditions, getConditions] = useState(new Map());
  const [value, getValue] = useState({
    indicator: false,
    condition: {description: ''},
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    getConditions(devicesRules(route.params.device.devices));
    setLoading(false);
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.device.name,
    });
  });

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
          Select a condition
        </Text>
      </View>

      <ScrollView style={listStyles.scrollView}>
        {conditions.map((data, key) => {
          return (
            <View key={key} style={listStyles.gpioContainer}>
              <Text style={listStyles.gpioName}>GPIO {key}</Text>
              {data.map((act, key2) => {
                return (
                  <TouchableOpacity
                    key={key2}
                    style={[
                      listStyles.mainContainer,
                      {
                        width: width * 0.8,
                      },
                    ]}
                    onPress={() =>
                      getValue({indicator: true, condition: act, index: key})
                    }>
                    <Text style={listStyles.name}>{act.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={value.indicator}>
        <View style={modalStyle.modalContainer}>
          <View
            style={[
              modalStyle.modelComponentsContainer,
              {
                marginBottom: height * 0.05,
                width: width * 0.9,
              },
            ]}>
            <Text style={modalStyle.topText}>
              {route.params.device.devices[value.index] !== 2
                ? 'Type a value'
                : 'Do you want this condition?'}
            </Text>
            {route.params.device.devices[value.index] !== 2 ? (
              <TextInput
                style={modalStyle.textInput}
                textAlign="center"
                textContentType="name"
                maxLength={4}
                keyboardType={
                  value.condition.keyboardType === 1 ? 'numeric' : 'default'
                }
                onChangeText={text => {
                  getValue({...value, name: text});
                }}
                value={value.name}
              />
            ) : (
              <Text style={modalStyle.textInput2}>
                {value.condition.description}
              </Text>
            )}
            <View style={modalStyle.modalOptionsContainer}>
              <TouchableOpacity
                style={modalStyle.modalOptionCancel}
                onPress={() => {
                  getValue({
                    indicator: false,
                    condition: {description: ''},
                  });
                }}>
                <Text style={modalStyle.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyle.modalOptionDelete}
                activeOpacity={value.name === '5' ? 0.2 : 1}
                onPress={() => {
                  var toret;
                  getValue({
                    indicator: false,
                    condition: {description: ''},
                  });
                  if (route.params.replace != null) {
                    toret = {
                      if: route.params.if,
                      index: route.params.replace,
                      device: {
                        deviceId:
                          route.params.device.type === 0
                            ? 0
                            : route.params.device.id,
                        gpio: value.index,
                      },
                      condition: {
                        id: value.condition.id,
                        description: value.condition.description.split('(')[0],
                        value:
                          route.params.device.devices[value.index] !== 2
                            ? value.name
                            : null,
                      },
                    };
                  } else {
                    toret = {
                      if: route.params.if,
                      device: {
                        deviceId:
                          route.params.device.type === 0
                            ? 0
                            : route.params.device.id,
                        gpio: value.index,
                      },
                      condition: {
                        id: value.condition.id,
                        description: value.condition.description.split('(')[0],
                        value:
                          route.params.device.devices[value.index] !== 2
                            ? value.name
                            : null,
                      },
                    };
                  }
                  navigation.navigate('AddRule', toret);
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
  topText: {
    fontWeight: '800',
    fontSize: 16,
    alignSelf: 'center',
    padding: '5%',
  },
  textInput: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'grey',
    padding: '2%',
  },
  textInput2: {
    alignSelf: 'center',
    padding: '2%',
    fontWeight: '800',
    fontSize: 20,
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

const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  scrollView: {
    marginBottom: 10,
  },
  mainContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
  },
  gpioContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  gpioName: {
    color: '#125c28',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const noDeviceStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
