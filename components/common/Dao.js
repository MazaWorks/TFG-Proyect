import AsyncStorage from '@react-native-community/async-storage';

export function getAllData(item) {
  return AsyncStorage.getItem(item)
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        toret = JSON.parse(value);
      }
      return toret;
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    });
}

export function getDevicesExceptRoom(name) {
  return AsyncStorage.getItem('devices')
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        toret = JSON.parse(value);
        for (let index = 0; index < toret.length; index++) {
          if (toret[index].room === name) {
            toret.splice(index, 1);
          }
        }
      }
      return toret;
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    });
}

export function getDevicesbyRoom(roomName) {
  return AsyncStorage.getItem('devices')
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        var allDevices = JSON.parse(value);
        for (let device of allDevices) {
          if (device.room != null && device.room === roomName) {
            toret.push(device);
          }
        }
      }
      return toret;
    })
    .catch(error => {
      console.log(error);
    });
}

export async function renameItem(name, array, item, newName) {
  var addDevices = false;
  var index = array.indexOf(item);
  if (name === 'rooms') {
    var devices = await getAllData('devices');
    for (let device of devices) {
      if (device.room != null && device.room === item.name) {
        device.room = newName;
        addDevices = true;
      }
    }
  }
  array[index].name = newName;
  return AsyncStorage.setItem(name, JSON.stringify(array))
    .then(() => {
      if (addDevices) {
        AsyncStorage.setItem('devices', JSON.stringify(devices));
      }
      return array;
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    });
}

export async function addDeviceToRoom(room, devices, items) {
  var añade = false;
  var mapNumberDevices = new Map();
  for (let item of items) {
    if (mapNumberDevices.has(item.room)) {
      mapNumberDevices.set(item.room, mapNumberDevices.get(item.room) + 1);
    } else {
      mapNumberDevices.set(item.room, 1);
    }
    for (let device of devices) {
      if (device.ip === item.ip) {
        device.room = room.name;
        añade = true;
        break;
      }
    }
  }
  if (añade) {
    await getAllData('rooms').then(value => {
      for (let room2 of value) {
        if (room2.name === room.name) {
          room2.numberDevices = room2.numberDevices + items.length;
        } else if (mapNumberDevices.has(room2.name)) {
          room2.numberDevices =
            room2.numberDevices - mapNumberDevices.get(room2.name);
        }
      }
      AsyncStorage.setItem('rooms', JSON.stringify(value));
    });
    AsyncStorage.setItem('devices', JSON.stringify(devices)).catch(error => {
      console.log('Error: ' + error.message);
    });
  }
}

export async function addItem(name, array, item) {
  var newValue = Object.assign([], array);
  var addDevices = false;
  if (name === 'devices') {
    for (var elements of item) {
      var add = true;
      for (var elements2 of newValue) {
        if (elements.ip === elements2.ip) {
          add = false;
          break;
        }
      }
      if (add) {
        newValue.push(elements);
        addDevices = true;
      }
    }
  } else if (name === 'rooms') {
    addDevices = true;
    for (let elements of newValue) {
      if (elements.name === item.name) {
        addDevices = false;
        break;
      }
    }
    if (addDevices) {
      newValue.push(item);
    }
  }
  if (addDevices) {
    return AsyncStorage.setItem(name, JSON.stringify(newValue))
      .then(() => {
        return newValue;
      })
      .catch(error => {
        console.log('Error: ' + error.message);
      });
  } else {
    return newValue;
  }
}

export async function deleteItem(name, array, item) {
  var addDevices = false;
  var index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
    if (name === 'rooms') {
      var devices = await getAllData('devices');
      if (devices.length !== 0) {
        for (let device of devices) {
          if (device.room != null && device.room === item.name) {
            device.room = null;
            addDevices = true;
          }
        }
      }
    }
    return AsyncStorage.setItem(name, JSON.stringify(array))
      .then(() => {
        if (addDevices) {
          AsyncStorage.setItem('devices', JSON.stringify(devices));
        }
        return array;
      })
      .catch(error => {
        console.log('Error: ' + error.message);
      });
  } else {
    return array;
  }
}
