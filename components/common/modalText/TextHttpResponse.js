import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function TextHttpResponse({status}) {
  switch (status) {
    case -1:
      return (
        <View style={style.container}>
          <Text style={style.topText}>INTERNAL ERROR</Text>
          <Text style={style.topText2}>Please try again</Text>
          <Text style={style.topText2}>or try to contact the author</Text>
        </View>
      );
    case 0:
      return (
        <View style={style.container}>
          <Text style={style.topText}>ESP8266 NOT FOUND</Text>
          <Text style={style.topText2}>Make sure the ESP8266 is active</Text>
          <Text style={style.topText2}>and you are on the same network</Text>
        </View>
      );
    case 200:
      return (
        <View style={style.container}>
          <Text style={style.topText}>Request completed successfully</Text>
        </View>
      );
    case 201:
      return (
        <View style={style.container}>
          <Text style={style.topText}>Rule has been created</Text>
        </View>
      );
    case 400:
      return (
        <View style={style.container}>
          <Text style={style.topText}>BAD REQUEST</Text>
          <Text style={style.topText2}>ESP8266 doesn't accept sent data</Text>
        </View>
      );
    case 404:
      return (
        <View style={style.container}>
          <Text style={style.topText}>SERVICE NOT FOUND</Text>
          <Text style={style.topText2}>
            ESP8266 doesn't provide this service
          </Text>
        </View>
      );
    case 409:
      return (
        <View style={style.container}>
          <Text style={style.topText}>CONFLICT OF RULES</Text>
          <Text style={style.topText2}>Maximum possible rules reached</Text>
          <Text style={style.topText2}>The GPIO may also not be active</Text>
        </View>
      );
  }
}

const style = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
    paddingBottom: 10,
  },
  topText: {
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    padding: '5%',
  },
  topText2: {
    fontWeight: '500',
    fontSize: 15,
    alignSelf: 'center',
  },
});
