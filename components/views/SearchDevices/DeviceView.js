import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';

export default function DeviceView({navigation, route}) {
  const [isLoading, setLoading] = useState(true);
  const [errorRequest, setErrorRequest] = useState({
    indicator: false,
    error: null,
  });
  const [readings, getReadings] = useState({
    temperature: 'searching...',
    humidity: 'searching...',
  });
  const {width, height} = useDimensions().window;

  useEffect(() => {
    fetch('http://' + route.params.device.ip + '/readings')
      .then(response => response.json())
      .then(json => {
        getReadings({
          temperature: json.Temperature + 'ºC',
          humidity: json.Humidity + '%',
        });
      })
      .catch(error => {
        setErrorRequest({
          indicator: true,
          error: error.message,
        });
        getReadings({
          temperature: 'Not Available',
          humidity: 'Not Available',
        });
      })
      .finally(() => setLoading(false));
  }, [route.params.device.ip]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://' + route.params.device.ip + '/readings')
        .then(response => response.json())
        .then(json => {
          getReadings({
            temperature: json.Temperature + 'ºC',
            humidity: json.Humidity + '%',
          });
        })
        .catch(error => {
          setErrorRequest({
            indicator: true,
            error: error.message,
          });
          getReadings({
            temperature: 'Not Available',
            humidity: 'Not Available',
          });
        });
    }, 60000);
    return () => clearInterval(interval);
  }, [route.params.device.ip]);

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
      <View
        style={[
          styles.dataContainer,
          {
            height: width * 0.4,
            marginBottom: height * 0.1,
          },
        ]}>
        <Text style={styles.name}>Temperature</Text>
        <Text style={styles.name}>{readings.temperature}</Text>
      </View>

      <View
        style={[
          styles.dataContainer,
          {
            height: width * 0.4,
          },
        ]}>
        <Text style={styles.name}>Humidity</Text>
        <Text style={styles.name}>{readings.humidity}</Text>
      </View>
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
