export function iconsRooms(type) {
  switch (type) {
    case 1:
      return {icon_name: 'bed', type: 'font-awesome'};
    case 2:
      return {icon_name: 'kitchen', type: 'material'};
    case 3:
      return {icon_name: 'bath', type: 'font-awesome'};
    case 4:
      return {icon_name: 'weekend', type: 'material'};
    case 5:
      return {icon_name: 'restaurant', type: 'material'};
    case 6:
      return {icon_name: 'baby', type: 'material-community'};
    case 7:
      return {icon_name: 'child', type: 'font-awesome'};
    case 8:
      return {icon_name: 'tree', type: 'material-community'};
  }
}

export function imagesDevices(type) {
  switch (type) {
    case 0:
      return require('../../assets/Devices/clock.png');
    case 1:
      return require('../../assets/Devices/DHT22.jpg');
  }
}

export function nameDefaultDevices(type) {
  switch (type) {
    case 1:
      return 'MedidorTemperatura';
  }
}

export function devicesRules(type) {
  switch (type) {
    case 0:
      return [{id: 0, keyboardType: 1, description: 'Wait ? minutes'}];
    case 1:
      return [
        {id: 1, keyboardType: 1, description: 'More than ?º (Temperature)'},
        {id: 2, keyboardType: 1, description: 'Less than ?º (Temperature)'},
        {id: 3, keyboardType: 1, description: 'More than ?% (Humidity)'},
        {id: 4, keyboardType: 1, description: 'Less than ?% (Humidity)'},
      ];
    case 2:
      return [
        {id: 1, keyboardType: 0, description: 'Turn On'},
        {id: 2, keyboardType: 0, description: 'Turn Off'},
      ];
  }
}
