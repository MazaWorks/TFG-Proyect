import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function ErrorResponse({status}) {
  switch (status) {
    case -1:
      return (
        <View style={style.container}>
          <Text style={style.topText}>ERROR INTERNO</Text>
          <Text style={style.topText2}>Inténtelo de nuevo</Text>
          <Text style={style.topText2}>o contacte con el creador</Text>
        </View>
      );
    case 0:
      return (
        <View style={style.container}>
          <Text style={style.topText}>ESP8266 NO ENCONTRADO</Text>
          <Text style={style.topText2}>Asegúrese que el ESP esté activo</Text>
          <Text style={style.topText2}>y estáis en la misma red</Text>
        </View>
      );
    case 1:
      return (
        <View style={style.container}>
          <Text style={style.topText}>NO SE PUEDE BORRAR</Text>
          <Text style={style.topText2}>Existe una regla en este ESP</Text>
          <Text style={style.topText2}>Borre todas las reglas de este ESP</Text>
        </View>
      );
    case 2:
      return (
        <View style={style.container}>
          <Text style={style.topText}>IMPOSIBLE AÑADIR REGLAS</Text>
          <Text style={style.topText2}>No hay módulos registrados</Text>
          <Text style={style.topText2}>Registre algún módulo antes</Text>
        </View>
      );
    case 200:
      return (
        <View style={style.container}>
          <Text style={style.topText}>Petición completada con éxito</Text>
        </View>
      );
    case 201:
      return (
        <View style={style.container}>
          <Text style={style.topText}>La regla ha sido creada</Text>
        </View>
      );
    case 400:
      return (
        <View style={style.container}>
          <Text style={style.topText}>PETICIÓN ERRÓNEA</Text>
          <Text style={style.topText2}>No se aceptan los datos enviados</Text>
        </View>
      );
    case 404:
      return (
        <View style={style.container}>
          <Text style={style.topText}>FUNCIÓN NO IMPLEMENTADA</Text>
          <Text style={style.topText2}>
            El ESP no tiene implementada esta función
          </Text>
        </View>
      );
    case 409:
      return (
        <View style={style.container}>
          <Text style={style.topText}>CONFLICTO DE REGLAS</Text>
          <Text style={style.topText2}>Máximo posible de reglas alcanzado</Text>
          <Text style={style.topText2}>Un GPIO puede no estar activo</Text>
        </View>
      );
  }
}

const style = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
    paddingBottom: 10,
  },
  topText: {
    fontWeight: 'bold',
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
