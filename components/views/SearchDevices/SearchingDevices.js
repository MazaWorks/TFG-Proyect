import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {useDimensions} from '@react-native-community/hooks';
import dgram from 'dgram';

export default function SearchingDevices({navigation, route}) {
  return null;
}
/*
const [isLoading, setLoading] = useState(true);
const [devices, setDevices] = useState(route.params.devices);


  useEffect(() => {
    var socket = dgram.createSocket('udp4');
    socket.bind();

    socket.once('listening', function() {
      console.log('Listenning');
      var msg = toByteArray('areyouesp');
      socket.send(msg, 0, msg.length, '8080', '192.168.0.255');
    });

    b.on('message', function(data, rinfo) {
      console.log('Algo recibido');
      var str = String.fromCharCode.apply(null, new Uint8Array(data));
      self.updateChatter('b received ' + str + ' ' + JSON.stringify(rinfo));

      console.log('Mensaje: ' + str);
    });
  }, []);

*/
