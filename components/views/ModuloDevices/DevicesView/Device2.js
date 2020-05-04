import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Switch,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';

export default function DeviceView({navigation, device}) {
  const [isLoading, setLoading] = useState(true);
  const [errorRequest, setErrorRequest] = useState({
    indicator: false,
    error: null,
  });
  const [readings, getReadings] = useState([]);
  const {height} = useDimensions().window;

  useEffect(() => {
    fetch('http://' + device.ip + '/readings')
      .then(response => response.json())
      .then(json => {
        getReadings(json.Values);
      })
      .catch(error => {
        setErrorRequest({
          indicator: true,
          error: error.message,
        });
        getReadings([]);
      })
      .finally(() => setLoading(false));
  }, [device.ip]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: device.name,
    });
  });

  function sendValues(value, key) {
    var url =
      value === 1
        ? 'http://' + device.ip + '/turnOn?pin=' + key
        : 'http://' + device.ip + '/turnOff?pin=' + key;
    fetch(url, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(json => {
        getReadings(json.Values);
      })
      .catch(error => {
        setErrorRequest({
          indicator: true,
          error: error.message,
        });
        getReadings([]);
      });
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 90}
          color="#0000ff"
        />
      </View>
    );
  }

  if (errorRequest.indicator) {
    return (
      <View style={styles.container}>
        <Text style={[errorStyles.text1, {marginBottom: height * 0.05}]}>
          {errorRequest.error}
        </Text>
        <Text style={errorStyles.text2}>
          Make sure the device is online and active
        </Text>
        <Text style={errorStyles.text2}>You have to be connected </Text>
        <Text style={errorStyles.text2}>to the same network as the device</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {readings.map((act, key) => {
        var enable = act === 0 ? false : true;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.dataContainer, {marginTop: height * 0.1}]}
            onPress={() => {
              var newValue = Object.assign([], readings);
              newValue[key] = !enable ? 1 : 0;
              getReadings(newValue);
              sendValues(newValue[key], key);
            }}>
            <Text style={styles.name}>Switch {key}</Text>
            <Switch
              disabled={true}
              style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
              trackColor={{false: '#767577', true: '#125c28'}}
              thumbColor={enable ? '#f5dd4b' : '#f4f3f4'}
              value={enable}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(46, 126, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    padding: 5,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

const errorStyles = StyleSheet.create({
  text1: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text2: {
    fontSize: 15,
    fontStyle: 'italic',
  },
});
