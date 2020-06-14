import React from 'react';
import Device1 from './DevicesView/Device1';

/**
 * Elige entre los diferentes tipos de módulos.
 * Por ahora solo tenemos los ESP8266-01.
 * Permite escalabilidad
 */
export default function DeviceView({navigation, route}) {
  switch (route.params.device.type) {
    case 1:
      return <Device1 navigation={navigation} device={route.params.device} />;
  }
}
