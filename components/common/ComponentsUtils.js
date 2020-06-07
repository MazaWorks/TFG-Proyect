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

export function roomsTop(type) {
  switch (type) {
    case 1:
      return {
        color: '#8a623b',
        image: require('../../assets/RoomViewTop/bedroom.png'),
      };
    case 2:
      return {
        color: '#d6d6d6',
        image: require('../../assets/RoomViewTop/kitchen.png'),
      };
    case 3:
      return {
        color: '#2d8080',
        image: require('../../assets/RoomViewTop/bathroom.png'),
      };
    case 4:
      return {
        color: '#125c28',
        image: require('../../assets/RoomViewTop/livingroom.png'),
      };
    case 5:
      return {
        color: '#b3b00c',
        image: require('../../assets/RoomViewTop/dinningroom.png'),
      };
    case 6:
      return {
        color: '#bd4f91',
        image: require('../../assets/RoomViewTop/babyroom.png'),
      };
    case 7:
      return {
        color: '#701818',
        image: require('../../assets/RoomViewTop/kidsroom.png'),
      };
    case 8:
      return {
        color: '#1c7812',
        image: require('../../assets/RoomViewTop/backyard.png'),
      };
  }
}

export function imagesDevices(type) {
  switch (type) {
    case 0:
      return require('../../assets/Devices/clock.png');
    case 1:
      return require('../../assets/Devices/ESP8266-01.jpeg');
  }
}

export function nameDefaultDevices(type) {
  switch (type) {
    case 1:
      return 'ESP8266-01';
  }
}

export function devicesRules(types) {
  var toret = [];
  for (let i = 0; i < types.length; i++) {
    switch (types[i]) {
      case -1:
        toret.push([
          {id: 0, keyboardType: 1, description: 'Esperar ? segundos'},
        ]);
        break;
      case 0:
        toret.push([]);
        break;
      case 1:
        toret.push([
          {id: 0, keyboardType: 1, description: 'Más de ?º (Temperatura)'},
          {id: 1, keyboardType: 1, description: 'Menos de ?º (Temperatura)'},
          {id: 2, keyboardType: 1, description: 'Más de ?% (Humedad)'},
          {id: 3, keyboardType: 1, description: 'Menos de ?% (Humedad)'},
        ]);
        break;
      case 2:
        toret.push([
          {id: 0, keyboardType: 0, description: 'Apagar'},
          {id: 1, keyboardType: 0, description: 'Encender'},
        ]);
        break;
    }
  }
  return toret;
}
