import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';

export default function DeviceView({navigation, route}) {
  const {width} = useDimensions().window;
  const [isLoading, setLoading] = useState(true);
  const [readings, getReadings] = useState({
    temperature: 'searching...',
    humidity: 'searching...',
  });

  useEffect(() => {
    fetch('http://' + route.params.device.ip + '/readings')
      .then(response => response.json())
      .then(json => {
        getReadings({
          temperature: json.Temperature + 'ºC',
          humidity: json.Humidity + '%',
        });
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://' + route.params.device.ip + '/readings')
        .then(response => response.json())
        .then(json => {
          getReadings({
            temperature: json.Temperature,
            humidity: json.Humidity,
          });
        })
        .catch(error => console.error(error));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.dataContainer,
            {
              width: width * 0.4,
              height: width * 0.4,
              marginBottom: '10%',
            },
          ]}>
          <Text style={styles.name}>Temperature</Text>
          <Text style={styles.name}>{readings.temperature}</Text>
        </View>

        <View
          style={[
            styles.dataContainer,
            {
              width: width * 0.4,
              height: width * 0.4,
            },
          ]}>
          <Text style={styles.name}>Humidity</Text>
          <Text style={styles.name}>{readings.humidity}</Text>
        </View>
      </View>
    </View>
  );
}
//  <View style={styles.optionsContainer}></View>
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 6,
    backgroundColor: 'rgba(46, 126, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'white',
  },
  optionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
