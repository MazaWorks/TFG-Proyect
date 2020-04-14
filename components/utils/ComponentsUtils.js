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

export function imagesDevices(idDevice) {
  switch (idDevice) {
    case 1:
      return require('../../assets/Devices/DHT22.jpg');
  }
}
