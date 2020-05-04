import React from 'react';
import Device1 from './DevicesView/Device1';
import Device2 from './DevicesView/Device2';

export default function DeviceView({navigation, route}) {
  switch (route.params.device.type) {
    case 1:
      return <Device1 navigation={navigation} device={route.params.device} />;
    case 2:
      return <Device2 navigation={navigation} device={route.params.device} />;
  }
}
