import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function TextHttpResponse({error}) {
  switch (error) {
    case 1:
      return (
        <View style={style.container}>
          <Text style={style.topText}>DELETE NOT ALLOWED</Text>
          <Text style={style.topText2}>A rule exist on this ESP</Text>
          <Text style={style.topText2}>
            delete all the rules on this module
          </Text>
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
