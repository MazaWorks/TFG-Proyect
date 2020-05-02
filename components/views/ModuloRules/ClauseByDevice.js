/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
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
import {OptimizedFlatList} from 'react-native-optimized-flatlist';
import {devicesRules} from '../../common/ComponentsUtils';

export default function MainView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [conditions, getConditions] = useState([]);
  const [value, getValue] = useState({
    indicator: false,
    condition: {description: ''},
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    setLoading(true);
    getConditions(devicesRules(route.params.device.type));
    setLoading(false);
  }, [route.params]);

  const Item = ({data}) => {
    return (
      <TouchableOpacity
        style={[
          listStyles.mainContainer,
          {
            width: width * 0.8,
          },
        ]}
        onPress={() => getValue({indicator: true, condition: data})}>
        <Text style={listStyles.name}>{data.description}</Text>
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
          Select a condition
        </Text>
      </View>
      <OptimizedFlatList
        style={{
          width: width * 0.8,
          marginBottom: height * 0.04,
        }}
        data={conditions}
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
              Conditions for {route.params.device.name}
            </Text>
          </View>
        }
      />
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
            <Text style={modalStyle.topText}>Type a value</Text>
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
                      deviceId:
                        route.params.device.type === 0
                          ? 0
                          : route.params.device.id,
                      condition: {
                        id: value.condition.id,
                        description: value.condition.description.split('(')[0],
                        value: value.name,
                      },
                    };
                  } else {
                    toret = {
                      if: route.params.if,
                      deviceId:
                        route.params.device.type === 0
                          ? 0
                          : route.params.device.id,
                      condition: {
                        id: value.condition.id,
                        description: value.condition.description.split('(')[0],
                        value: value.name,
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
    borderBottomWidth: 2,
    borderColor: 'gainsboro',
  },
  mainContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
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
});

const noDeviceStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#e4ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
