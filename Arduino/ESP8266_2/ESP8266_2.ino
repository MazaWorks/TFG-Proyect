#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESPAsyncWiFiManager.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

//Descomentar en caso de sensores
//#include <Adafruit_Sensor.h>
//#include <DHT.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>

#define APSSID "ESP8266-2"
#define APPASS "mypass"
// Automatize
#define NUMREGLAS 10
#define MAXACCIONES 10
#define IPSIZE 50

//Descomentar en caso de sensores
//#define GPIODHT 0

AsyncWebServer server(80);
DNSServer dns;
WiFiUDP Udp;

//Descomentar en caso de sensores
//DHT dht(GPIODHT, DHT22);
byte i;
byte i2;

//Descomentar en caso de sensores
/*float temperatura = 0.0;
float newT = 0.0;
float humedad = 0.0;
float newH = 0.0;
unsigned long previousMillis = 0;
const long interval = 60000;*/
unsigned long currentMillis;

const byte tiposGpio[4] = {2,2,2,2};
// Change "id", "type 1" => ESP8266, "devices" most be types of GPIO
const char respuestaUDP[50] = "{\"id\": 2,\"type\": 1,\"devices\": [2,2,2,2]}";
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];

// Automatize variables
const char rulesToSend[2][8] = {"turnOff", "turnOn"};
StaticJsonDocument<JSON_OBJECT_SIZE(2) + 20 * JSON_OBJECT_SIZE(3)> doc;
// Información de las reglas
byte condicionActiva[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
byte condicionID[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
byte condicionTipoGpio[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
byte condicionGpio[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
short condicionValor[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
byte numeroAcciones[NUMREGLAS];
byte tipoAccion[NUMREGLAS][MAXACCIONES];
char acciones[NUMREGLAS][MAXACCIONES][IPSIZE];
byte typeGpio = 0;
// Información del timer
unsigned long reglasTimerMillies[NUMREGLAS];
unsigned long reglasTimerPrevMillies[NUMREGLAS];
byte rulesToContinue[NUMREGLAS] = {0,0,0,0,0,0,0,0,0,0};
// Indicadores de regla
byte added = 0;
byte existe = 0;
// Rules IDs
byte id = 0;
byte gpio = 0;
short value = 0;
// Regla que se procederá a ejecutar
byte ruleToExecute = 0;
// RequestBody recibido
String body;

// En caso de sensores, reemplazar los %V#% por : {"Temperature": %TEMPERATURE%, "Humidity": %HUMIDITY%}
const char readResponse[] PROGMEM = R"rawliteral(
{"Values": [%V0%, %V1%, %V2%, %V3%]} )rawliteral";
  
// Replaces placeholder with values
String processor(const String& var) {
  if(var == "V0"){
    return String(digitalRead(0), DEC);
  } else if(var == "V1"){
    return String(digitalRead(1), DEC);
  } else if(var == "V2"){
    return String(digitalRead(2), DEC);
  } else if(var == "V3"){
    return String(digitalRead(3), DEC);
  }
  
  //Descomentar en caso de sensores
  /*else if (var == "TEMPERATURE"){
    return String(temperatura);
  } else if (var == "HUMIDITY"){
    return String(humedad);
  } */
  else {
    return String("0");
  }
}

void automatize(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
  for(size_t i=0; i<len; i++) {
    body += (char)data[i];
  }
  if(index + len == total) {
    DeserializationError err = deserializeJson(doc, body);
    body = "";
    if (!err) {
      JsonObject mesurer = doc["if"].as<JsonObject>();
      typeGpio = tiposGpio[mesurer["gpio"].as<int>()];
      added = 0;
      if (typeGpio != 0) {
        id = mesurer["id"].as<int>();
        gpio = mesurer["gpio"].as<int>();
        value = mesurer["value"].as<int>();
        //Comprueba que no haya reglas repetidas
        existe = 0;
        for (i = 0; i < NUMREGLAS; i++) {
          if(condicionID[i] == id && condicionGpio[i] == gpio && condicionValor[i] == value) {
            existe = i + 1;
            break;
          }
        }
        if(!existe) {
          for (i = 0; i < NUMREGLAS; i++) {
            if(condicionTipoGpio[i] == 0) {
              condicionID[i] = id;
              condicionGpio[i] = gpio;
              condicionTipoGpio[i] = typeGpio;
              condicionValor[i] = value;
              JsonObject act;
              JsonArray then = doc["then"].as<JsonArray>();
              numeroAcciones[i] = then.size();
              for (i2 = 0; i2 < then.size(); i2++) {
                act = then[i2].as<JsonObject>();
                String ip = act["ip"].as<String>();
                String timer = act["timer"].as<String>();
                if(ip != "null") {
                  String("http://" + ip + "/" + rulesToSend[act["id"].as<int>()] + "?gpio=" + act["gpio"].as<String>()).toCharArray(acciones[i][i2], IPSIZE);
                  tipoAccion[i][i2] = 0;
                } else if(timer != "null") {
                  String(timer).toCharArray(acciones[i][i2], IPSIZE);
                  tipoAccion[i][i2] = 1;
                } else {
                  String(act["gpio"].as<String>() + act["id"].as<String>()).toCharArray(acciones[i][i2], IPSIZE);
                  tipoAccion[i][i2] = 2;
                }
              }
              condicionActiva[i] = 1;
              added = 1;
              break;
            }
          }
        } else {
          JsonObject act;
          JsonArray then = doc["then"].as<JsonArray>();
          numeroAcciones[existe - 1] = then.size();
          for (i2 = 0; i2 < then.size(); i2++) {
            act = then[i2].as<JsonObject>();
            String ip = act["ip"].as<String>();
            String timer = act["timer"].as<String>();
            if(ip != "null") {
              String("http://" + ip + "/" + rulesToSend[act["id"].as<int>()] + "?gpio=" + act["gpio"].as<String>()).toCharArray(acciones[existe - 1][i2], IPSIZE);
              tipoAccion[existe - 1][i2] = 0;
            } else if(timer != "null") {
              String(timer).toCharArray(acciones[existe - 1][i2], IPSIZE);
              tipoAccion[existe - 1][i2] = 1;
            } else {
              String(act["gpio"].as<String>() + act["id"].as<String>()).toCharArray(acciones[existe - 1][i2], IPSIZE);
              tipoAccion[existe - 1][i2] = 2;
            }
          }
          condicionActiva[existe - 1] = 1;
          added = 2;
        }
      }
      if(added == 1) {
        request->send(201);
      } else if(added == 2){
        request->send(200);
      } else {
        request->send(409);
      }
    } else {
      request->send(400);
    }
  }
}

//Descomentar en caso de sensores
/*
void activateRuleType1(float temperatura, float humedad) {
  for (i2 = 0; i2 < NUMREGLAS; i2++) {
    if(!condicionActiva[i2] && condicionTipoGpio[i2] == 1) {
      if(condicionID[i2] == 0) {
        if(temperatura < condicionValor[i2]) {
          condicionActiva[i2] = 1;
        }
      } else if(condicionID[i2] == 1) {
        if(temperatura > condicionValor[i2]) {
          condicionActiva[i2] = 1;
        }
      } else if(condicionID[i2] == 2) {
        if(humedad < condicionValor[i2]) {
          condicionActiva[i2] = 1;
        }
      } else if(condicionID[i2] == 3) {
        if(humedad > condicionValor[i2]) {
          condicionActiva[i2] = 1;
        }
      }
    }
  }
}*/

void activateRuleType2(int gpio, boolean on) {
  for (i2 = 0; i2 < NUMREGLAS; i2++) {
    if(!condicionActiva[i2] && condicionGpio[i2] == gpio && condicionTipoGpio[i2] == 2 && condicionID[i2] != on) {
      condicionActiva[i2] = 1;
    }
  }
}

void setup() {
  //Serial.begin(9600);
  
  // Pins set as output
  pinMode(0, OUTPUT);
  pinMode(1, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  
//Descomentar en caso de sensores
  //dht.begin();

  AsyncWiFiManager wifiManager(&server, &dns);
  if (!wifiManager.autoConnect(APSSID, APPASS)) {
    ESP.reset();
    delay(1000);
  }
  
  server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "application/json", readResponse, processor);
  });
  server.on("/turnOn", HTTP_POST, [](AsyncWebServerRequest *request){
    if(request->hasParam("gpio")) {
      AsyncWebParameter* p = request->getParam("gpio");
      int gpio = p->value().toInt();
      if((gpio == 0 && p->value().equals(String(0))) || (gpio > 0 && gpio < 4)){
        digitalWrite(gpio, HIGH);
        request->send_P(200, "application/json", readResponse, processor);
        activateRuleType2(gpio, HIGH);
      } else {
        request->send(400);
      }
    } else {
      request->send(400);
    }
  });
  server.on("/turnOff", HTTP_POST, [](AsyncWebServerRequest *request){
    if(request->hasParam("gpio")) {
      AsyncWebParameter* p = request->getParam("gpio");
      int gpio = p->value().toInt();
      if((gpio == 0 && p->value().equals(String(0))) || (gpio > 0 && gpio < 4)) {
        digitalWrite(gpio, LOW);
        request->send_P(200, "application/json", readResponse, processor);
        activateRuleType2(gpio, LOW);
      } else {
        request->send(400);
      }
    } else {
      request->send(400);
    }
  });
  server.on("/automatize", HTTP_POST, [](AsyncWebServerRequest * request){}, NULL, automatize);
  server.on("/automatize", HTTP_DELETE, [](AsyncWebServerRequest *request){
    if(request->hasParam("gpio") && request->hasParam("id")) {
      AsyncWebParameter* param1 = request->getParam("id");
      AsyncWebParameter* param2 = request->getParam("gpio");
      int gpio = param2->value().toInt();
      int id = param1->value().toInt();
      if(((gpio == 0 && param2->value().equals(String(0))) || (gpio > 0 && gpio < 4))
            && (id == 0 && param1->value().equals(String(0)) || id > 0)) {
        for (i = 0; i < NUMREGLAS; i++) {
          if(condicionGpio[i] == gpio && condicionID[i] == id) {
            if(tiposGpio[gpio] == 2) {
              condicionActiva[i] = 0;
              condicionID[i] = 0;
              condicionGpio[i] = 0;
              condicionTipoGpio[i] = 0;
            } else if(tiposGpio[gpio] == 1 && request->hasParam("value")
                && condicionValor[i] == request->getParam("value")->value().toInt()) {
              condicionActiva[i] = 0;
              condicionID[i] = 0;
              condicionGpio[i] = 0;
              condicionValor[i] = 0;
              condicionTipoGpio[i] = 0;
            }
          }
        }
        request->send(200);
      } else {
        request->send(400);
      }
    } else {
      request->send(400);
    }
  });
  server.onNotFound([](AsyncWebServerRequest *request) {
    request->send(404);
  });

  Udp.begin(8080);
  server.begin();
  
  //Descomentar en caso de sensores
  /*
  newT = dht.readTemperature();
  newH = dht.readHumidity();
  if (!(isnan(newT) || isnan(newH)))
  {
    temperatura = newT;
    humedad = newH;
    activateRuleType1(temperatura,humedad);
  }*/
}

void loop() {
  currentMillis = millis();

  int packetSize = Udp.parsePacket();
  if (packetSize) {
    int n = Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    packetBuffer[n] = 0;
    String requestMessage = packetBuffer;
    requestMessage.trim();
    if (requestMessage.equals("?")) {
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write(respuestaUDP);
      Udp.endPacket();
    }
  }

  for (i = 0; i < NUMREGLAS; i++) {
    if(reglasTimerMillies[i] != 0) {
      if(currentMillis - reglasTimerPrevMillies[i] >= reglasTimerMillies[i]) {
        condicionActiva[i] = 1;
        reglasTimerMillies[i] = 0;
      }
    }
  }
  
  for (i = 0; i < NUMREGLAS; i++) {
    if(condicionActiva[i]) {
      //Descomentar en caso de sensores
      /*if(condicionTipoGpio[i] == 1) {
        if(condicionID[i] == 0) {
          if(temperatura > condicionValor[i]) {
            ruleToExecute = i + 1;
            break;
          }
        } else if(condicionID[i] == 1) {
          if(temperatura < condicionValor[i]) {
            ruleToExecute = i + 1;
            break;
          }
        } else if(condicionID[i] == 2) {
          if(humedad > condicionValor[i]) {
            ruleToExecute = i + 1;
            break;
          }
        } else if(condicionID[i] == 3) {
          if(humedad < condicionValor[i]) {
            ruleToExecute = i + 1;
            break;
          }
        }
      } else*/ 
      if(condicionTipoGpio[i] == 2) {
        if(condicionID[i] == 0) {
          if(!digitalRead(condicionGpio[i])) {
            ruleToExecute = i + 1;
            break;
          }
        }
        if(condicionID[i] == 1) {
          if(digitalRead(condicionGpio[i])) {
            ruleToExecute = i + 1;
            break;
          }
        }
      }
      if(rulesToContinue[i]) {
        ruleToExecute = i + 1;
        break;
      }
    }
  }
  if (ruleToExecute) {
    condicionActiva[ruleToExecute - 1] = 0;
    for (i = rulesToContinue[ruleToExecute - 1]; i < numeroAcciones[ruleToExecute - 1]; i++) {
      if(rulesToContinue[ruleToExecute - 1]) {
        rulesToContinue[ruleToExecute - 1] = 0;
      }
      if(tipoAccion[ruleToExecute - 1][i] == 2) {
        digitalWrite(String(acciones[ruleToExecute - 1][i][0]).toInt(), String(acciones[ruleToExecute - 1][i][1]).toInt());
        activateRuleType2(String(acciones[ruleToExecute - 1][i][0]).toInt(), String(acciones[ruleToExecute - 1][i][1]).toInt());
      } else if(tipoAccion[ruleToExecute - 1][i] == 1) {
        rulesToContinue[ruleToExecute - 1] = i + 1;
        reglasTimerMillies[ruleToExecute - 1] = String(acciones[ruleToExecute - 1][i]).toInt() * 1000;
        reglasTimerPrevMillies[ruleToExecute - 1] = currentMillis;
        break;
      } else {
        WiFiClient client;
        HTTPClient http;
        delay(5000);
        http.begin(client, acciones[ruleToExecute - 1][i]);
        http.POST("");
        http.end();
      }
    }
    ruleToExecute = 0;
  }

  //Descomentar en caso de sensores
/*
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    newT = dht.readTemperature();
    newH = dht.readHumidity();
    if (!(isnan(newT) || isnan(newH))) {
      temperatura = newT;
      humedad = newH;
      activateRuleType1(temperatura,humedad);
    }
  }*/
}
