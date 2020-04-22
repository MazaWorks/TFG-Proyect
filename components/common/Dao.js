import AsyncStorage from '@react-native-community/async-storage';

export function getAllData(item, refreshView, setLoading) {
  AsyncStorage.getItem(item)
    .then(value => {
      if (value != null && value !== '') {
        refreshView(JSON.parse(value));
      }
      setLoading(false);
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    });
}

export function getDevicesbyRoom(roomName, setDevices, setLoading) {
  AsyncStorage.getItem('devices')
    .then(value => {
      var toret = [];
      if (value != null && value !== '') {
        var allDevices = JSON.parse(value);
        for (let device of allDevices) {
          if (device.room != null && device.room === roomName) {
            toret.push(device);
          }
        }
        setDevices(toret);
      }
      setLoading(false);
    })
    .catch(error => {
      console.log(error);
    });
}

export function renameItem(name, array, item, rename) {
  var addDevices = false;
  if (rename.indicator) {
    var index = array.indexOf(item);
    array[index].name = rename.name;
    addDevices = true;
  }
  if (addDevices) {
    AsyncStorage.setItem(name, JSON.stringify(array)).catch(error => {
      console.log('Error: ' + error.message);
    });
  }
}

export function addItem(name, array, item, refreshView, setLoading) {
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
  refreshView(newValue);
  if (addDevices) {
    AsyncStorage.setItem(name, JSON.stringify(newValue))
      .then(setLoading(false))
      .catch(error => {
        console.log('Error: ' + error.message);
      });
  } else {
    setLoading(false);
  }
}

export function deleteItem(name, array, item, refreshView) {
  var index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
    refreshView(array);
    AsyncStorage.setItem(name, JSON.stringify(array)).catch(error => {
      console.log('Error: ' + error.message);
    });
  }
}
