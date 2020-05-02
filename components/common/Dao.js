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

export async function getDevicebyRule(rules, allDevices) {
  const ids = new Set();
  if (!allDevices) {
    for (let rule of rules) {
      ids.add(rule.if.deviceId);
      for (let then of rule.then) {
        if (then.deviceId != null) {
          ids.add(then.deviceId);
        }
      }
    }
  }
  return AsyncStorage.getItem('devices')
    .then(value => {
      const toret = new Map();
      if (value != null && value !== '') {
        var allData = JSON.parse(value);
        for (let device of allData) {
          if (!allDevices) {
            if (ids.has(device.id)) {
              toret.set(device.id, device);
            }
          } else {
            toret.set(device.id, device);
          }
        }
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
      console.log('Error: ' + error.message);
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

export async function addItem(name, array, item, index) {
  console.log(index);
  var newValue = Object.assign([], array);
  var addDevices = false;
  var diffName = 0;
  if (name === 'rules') {
    if (index != null) {
      addDevices = true;
      newValue[index] = item;
    } else {
      addDevices = true;
      newValue.push(item);
    }
  } else if (name === 'devices') {
    for (var elements of item) {
      var add = true;
      for (var elements2 of newValue) {
        if (elements.id === elements2.id) {
          add = false;
          break;
        } else if (elements.name === elements2.name.split('_')[0]) {
          diffName = !Number.isNaN(Number(elements2.name.split('_')[1]))
            ? Number(elements2.name.split('_')[1]) + 1
            : 2;
        }
      }
      if (add) {
        if (diffName) {
          elements.name = elements.name + '_' + diffName;
        }
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
  var addPlus = false;
  var index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
    if (name === 'rules') {
      return AsyncStorage.setItem(name, JSON.stringify(array))
        .then(() => {
          return array;
        })
        .catch(error => {
          console.log('Error: ' + error.message);
        });
    } else if (name === 'rooms') {
      var devices = await getAllData('devices');
      if (devices.length !== 0) {
        for (let device of devices) {
          if (device.room != null && device.room === item.name) {
            device.room = null;
            addPlus = true;
          }
        }
      }
      return AsyncStorage.setItem(name, JSON.stringify(array))
        .then(() => {
          if (addPlus) {
            AsyncStorage.setItem('devices', JSON.stringify(devices));
          }
          return array;
        })
        .catch(error => {
          console.log('Error: ' + error.message);
        });
    } else if (name === 'devices') {
      var rooms = await getAllData('rooms');
      if (rooms.length !== 0) {
        for (let room of rooms) {
          if (room.name != null && room.name === item.room) {
            room.numberDevices--;
            addPlus = true;
          }
        }
      }
      return AsyncStorage.setItem(name, JSON.stringify(array))
        .then(() => {
          if (addPlus) {
            AsyncStorage.setItem('rooms', JSON.stringify(rooms));
          }
          return array;
        })
        .catch(error => {
          console.log('Error: ' + error.message);
        });
    }
  } else {
    return array;
  }
}
