import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function TextHttpResponse({status}) {
  switch (status) {
    case -1:
      return (
        <View>
          <Text style={style.topText}>Error al guardar la regla</Text>
          <Text style={style.topText2}>El ESP ha creado la regla pero</Text>
          <Text style={style.topText2}>
            no se ha podido almacenar en tu dispositivo movil
          </Text>
        </View>
      );
    case 0:
      return (
        <View>
          <Text style={style.topText}>ESP8266 no encontrado</Text>
          <Text style={style.topText2}>
            Asegurese que el ESP8266 está activo
          </Text>
          <Text style={style.topText2}>
            y que estais conectados a la misma red
          </Text>
        </View>
      );
    case 200:
      return (
        <View>
          <Text style={style.topText}>La regla ha sido remplazada</Text>
          <Text style={style.topText}>correctamente</Text>
        </View>
      );
    case 201:
      return (
        <View>
          <Text style={style.topText}>La regla ha sido creada</Text>
          <Text style={style.topText}>correctamente</Text>
        </View>
      );
    case 400:
      return (
        <View>
          <Text style={style.topText}>Petición errónea</Text>
          <Text style={style.topText2}>El ESP8266 no acepta</Text>
          <Text style={style.topText2}>los datos enviados</Text>
        </View>
      );
    case 404:
      return (
        <View>
          <Text style={style.topText}>Servicio no encontrado</Text>
          <Text style={style.topText2}>
            El ESP8266 no dispone de este servicio
          </Text>
        </View>
      );
    case 409:
      return (
        <View>
          <Text style={style.topText}>Error al crear la regla</Text>
          <Text style={style.topText2}>
            Se ha alcanzado el máximo de reglas posibles
          </Text>
          <Text style={style.topText2}>
            El GPIO tambien puede no estar activo
          </Text>
        </View>
      );
  }
}

const style = StyleSheet.create({
  topText: {
    fontWeight: '800',
    fontSize: 18,
    alignSelf: 'center',
    padding: '5%',
  },
  topText2: {
    fontWeight: '500',
    fontSize: 15,
    alignSelf: 'center',
  },
});
