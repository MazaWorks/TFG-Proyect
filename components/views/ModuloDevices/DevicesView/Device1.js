import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';

/**
 * Vista de módulos ESP8266-01.
 * Muestra los estados de los dispositivos asociados a este módulo.
 * Se permite modificar los estados de los dispositivos que no sean sensores
 */
export default function DeviceView({navigation, device}) {
  const [isLoading, setLoading] = useState(true);
  const hasDHT = device.devices.indexOf(1) !== -1;
  const [readings, getReadings] = useState([]);
  const [errorRequest, setErrorRequest] = useState({
    indicator: false,
    error: null,
  });
  const {width, height} = useDimensions().window;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: device.name,
    });
  });

  useEffect(() => {
    var abort = false;
    fetch('http://' + device.ip + '/readings')
      .then(response => response.json())
      .then(json => {
        if (!abort) {
          getReadings(json.Values);
        }
      })
      .catch(error => {
        if (!abort) {
          setErrorRequest({
            indicator: true,
            error: error.message,
          });
        }
      })
      .finally(() => {
        if (!abort) {
          setLoading(false);
        }
      });
    return () => {
      abort = true;
    };
  }, [device.ip]);

  useEffect(() => {
    var abort = false;
    if (hasDHT) {
      const interval = setInterval(() => {
        fetch('http://' + device.ip + '/readings')
          .then(response => response.json())
          .then(json => {
            if (!abort) {
              getReadings(json.Values);
            }
          })
          .catch(error => {
            if (!abort) {
              setErrorRequest({
                indicator: true,
                error: error.message,
              });
            }
          });
      }, 60000);
      return () => {
        abort = true;
        clearInterval(interval);
      };
    }
  }, [device.ip, hasDHT]);

  function sendValues(value, key) {
    var url =
      value === 1
        ? 'http://' + device.ip + '/turnOn?gpio=' + key
        : 'http://' + device.ip + '/turnOff?gpio=' + key;
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
        <Text style={errorStyles.text2}>Asegúrate de estar conectado</Text>
        <Text style={errorStyles.text2}>a la misma red que los módulos</Text>
        <Text style={errorStyles.text2}>y que estén online y activos</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {readings.map((act, key) => {
        if (device.devices[key] === 2) {
          var enable = act === 0 ? false : true;
          return (
            <TouchableOpacity
              key={key}
              style={styles.dataContainer}
              onPress={() => {
                var newValue = Object.assign([], readings);
                newValue[key] = !enable ? 1 : 0;
                getReadings(newValue);
                sendValues(newValue[key], key);
              }}>
              <Text style={styles.name}>GPIO {key}</Text>
              <Switch
                disabled={true}
                style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
                trackColor={{false: '#767577', true: '#125c28'}}
                thumbColor={enable ? '#f5dd4b' : '#f4f3f4'}
                value={enable}
              />
            </TouchableOpacity>
          );
        } else if (device.devices[key] === 1) {
          return (
            <View key={key} style={styles.tempHumContainer}>
              <Text style={styles.name}>GPIO {key}</Text>
              <View style={styles.tempHumContainer2}>
                <View
                  style={[
                    styles.tempHumCircle,
                    {
                      width: width * 0.3,
                      height: width * 0.3,
                    },
                  ]}>
                  <Text style={styles.name}>Temperatura</Text>
                  <Text style={styles.name}>{act.Temperature}ºC</Text>
                </View>

                <View
                  style={[
                    styles.tempHumCircle,
                    {
                      width: width * 0.3,
                      height: width * 0.3,
                    },
                  ]}>
                  <Text style={styles.name}>Humedad</Text>
                  <Text style={styles.name}>{act.Humidity}%</Text>
                </View>
              </View>
            </View>
          );
        }
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
    justifyContent: 'space-evenly',
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '80%',
    padding: 20,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'white',
  },
  tempHumContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '80%',
    padding: 5,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'white',
  },
  tempHumContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    padding: 5,
  },
  tempHumCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'white',
  },
  name: {
    fontSize: 14,
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
