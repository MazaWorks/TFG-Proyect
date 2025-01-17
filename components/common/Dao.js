//DAO; maneja la lógica de la aplicación
import AsyncStorage from '@react-native-community/async-storage';

/**
 * Devuelve el array con todos los datos en JSON
 */
export function getAllData(item) {
  return AsyncStorage.getItem(item)
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        toret = JSON.parse(value);
      }
      return toret;
    })
    .catch(() => {
      return [];
    });
}

/**
 * Devuelve un mapa con todos los módulos registrados por la app
 */
export async function getMapDevices() {
  return AsyncStorage.getItem('devices')
    .then(value => {
      const toret = new Map();
      if (value != null && value !== '') {
        for (let device of JSON.parse(value)) {
          toret.set(device.id, device);
        }
      }
      return toret;
    })
    .catch(() => {
      return new Map();
    });
}

/**
 * Devuelve todos los módulos registrados por la app y que no estén asociados
 * a una habitación específica
 */
export function getDevicesExceptRoom(name) {
  return AsyncStorage.getItem('devices')
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        for (let device of JSON.parse(value)) {
          if (device.room !== name) {
            toret.push(device);
          }
        }
      }
      return toret;
    })
    .catch(() => {
      return [];
    });
}

/**
 * Devuelve todos los módulos asociados a una habitación específica
 */
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
    .catch(() => {
      return [];
    });
}

/**
 * Renombrar un elemento específico (puede ser habitación o módulo)
 */
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
    .catch(() => {
      return array;
    });
}

/**
 * Asocia un dispositivo a una habitación
 */
export async function addDeviceToRoom(room, items) {
  var añade = false;
  var mapNumberDevices = new Map();
  var devices = await getAllData('devices');
  for (let item of items) {
    if (mapNumberDevices.has(item.room)) {
      mapNumberDevices.set(item.room, mapNumberDevices.get(item.room) + 1);
    } else {
      mapNumberDevices.set(item.room, 1);
    }
    for (let device of devices) {
      if (device.id === item.id) {
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
    AsyncStorage.setItem('devices', JSON.stringify(devices));
  }
}

/**
 * Añade un elemento específico (puede ser habitación, módulo o regla)
 */
export async function addItem(name, array, item, index) {
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
    addDevices = true;
    for (let elements of item) {
      var add = true;
      for (var elements2 of newValue) {
        if (elements.id === elements2.id) {
          elements2.ip = elements.ip;
          elements2.devices = elements.devices;
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
      .catch(() => {
        return newValue;
      });
  } else {
    return newValue;
  }
}

/**
 * Elimina un elemento específico (puede ser habitación, módulo o regla)
 */
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
        .catch(() => {
          return array;
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
        .catch(() => {
          return array;
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
        .catch(() => {
          return array;
        });
    }
  } else {
    return array;
  }
}

/**
 * Devuelve un boolean indicando si existen reglas en un módulo específico
 */
export async function existRuleOnDevice(item) {
  var rules = await getAllData('rules');
  for (const rule of rules) {
    if (rule.if.device.deviceId === item.id) {
      return true;
    }
    for (const action of rule.then) {
      if (action.device.deviceId === item.id) {
        return true;
      }
    }
  }
  return false;
}
