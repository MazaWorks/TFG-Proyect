#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESPAsyncWiFiManager.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>

#define APSSID "ESP8266-01"
#define APPASS "root"
#define GPIODHT 0
// Automatize
#define NUMRULES 10
#define MAXIPS 10
#define IPSIZE 50

AsyncWebServer server(80);
DNSServer dns;
DHT dht(GPIODHT, DHT22);
WiFiUDP Udp;
byte i;
byte i2;
float t = 0.0;
float h = 0.0;
unsigned long previousMillis = 0;
const long interval = 60000;
const int gpioTypes[4] = {1,2,2,2};
// Change "id", "type 1" => ESP8266, "devices" most be types of GPIO
const char responseUDP[50] = "{\"id\": 1,\"type\": 1,\"devices\": [1,2,2,2]}";
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];

// Automatize variables
const char rulesToSend[2][8] = {"turnOff", "turnOn"};
StaticJsonDocument<JSON_OBJECT_SIZE(2) + 20 * JSON_OBJECT_SIZE(3)> doc;
// Información de las reglas
boolean mesurerActive[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int mesurerId[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int mesurerTypeGpio[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int mesurerGpio[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int mesurerValues[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int thenSize[NUMRULES] = {0,0,0,0,0,0,0,0,0,0};
int ToSendLocal[NUMRULES][MAXIPS];
char ipsToSend[NUMRULES][MAXIPS][IPSIZE];
int typeGpio = 0;
// Indicadores de regla
boolean added = 0;
boolean existe = 0;
// Rules IDs
int id = 0;
int gpio = 0;
int value = 0;
// Regla que se procederá a ejecutar
int ruleToExecute = -1;
// RequestBody recibido
String body;

// On DHT22, replace a %V#% by : {"Temperature": %TEMPERATURE%, "Humidity": %HUMIDITY%}
const char readResponse[] PROGMEM = R"rawliteral(
{"Values": [{"Temperature": %TEMPERATURE%, "Humidity": %HUMIDITY%}, %V1%, %V2%, %V3%]} )rawliteral";
  
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
  } else if (var == "TEMPERATURE"){
    return String(t);
  } else if (var == "HUMIDITY"){
    return String(h);
  } else {
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
      typeGpio = gpioTypes[mesurer["gpio"].as<int>()];
      added = 0;
      if (typeGpio != 0) {
        id = mesurer["id"].as<int>();
        gpio = mesurer["gpio"].as<int>();
        value = mesurer["value"].as<int>();
        //Comprueba que no haya reglas repetidas
        existe = 0;
        for (i = 0; i < NUMRULES; i++) {
          if(mesurerId[i] == id && mesurerGpio[i] == gpio && mesurerValues[i] == value) {
            existe = 1;
            break;
          }
        }
        if(!existe) {
          for (i = 0; i < NUMRULES; i++) {
            if(mesurerTypeGpio[i] == 0) {
              mesurerId[i] = id;
              mesurerGpio[i] = gpio;
              mesurerTypeGpio[i] = typeGpio;
              mesurerValues[i] = value;
              JsonObject act;
              JsonArray then = doc["then"].as<JsonArray>();
              thenSize[i] = then.size();
              for (i2 = 0; i2 < then.size(); i2++) {
                act = then[i2].as<JsonObject>();
                String ip = act["ip"].as<String>();
                if(ip != "null"){
                  String("http://" + ip + "/" + rulesToSend[act["id"].as<int>()] + "?gpio=" + act["gpio"].as<String>()).toCharArray(ipsToSend[i][i2], IPSIZE);
                  ToSendLocal[i][i2] = 0;
                } else {
                  String(act["gpio"].as<String>() + act["id"].as<String>()).toCharArray(ipsToSend[i][i2], IPSIZE);
                  ToSendLocal[i][i2] = 1;
                }
              }
              mesurerActive[i] = 1;
              added = 1;
              break;
            }
          }
        }
      }
      if(added) {
        request->send(201);
      } else {
        request->send(409);
      }
    } else {
      request->send(400);
    }
  }
}

void activateRuleType1(float t, float h) {
  for (i2 = 0; i2 < NUMRULES; i2++) {
    if(!mesurerActive[i2] && mesurerTypeGpio[i2] == 1) {
      if(mesurerId[i2] == 0) {
        if(t < mesurerValues[i2]) {
          mesurerActive[i2] = 1;
        }
      } else if(mesurerId[i2] == 1) {
        if(t > mesurerValues[i2]) {
          mesurerActive[i2] = 1;
        }
      } else if(mesurerId[i2] == 2) {
        if(h < mesurerValues[i2]) {
          mesurerActive[i2] = 1;
        }
      } else if(mesurerId[i2] == 3) {
        if(h > mesurerValues[i2]) {
          mesurerActive[i2] = 1;
        }
      }
    }
  }
}

void activateRuleType2(int gpio, boolean on) {
  for (i2 = 0; i2 < NUMRULES; i2++) {
    if(!mesurerActive[i2] && mesurerGpio[i2] == gpio && mesurerTypeGpio[i2] == 2 && mesurerId[i2] != on) {
      mesurerActive[i2] = 1;
    }
  }
}

void setup() {
  // Serial.begin(9600);
  // Pins set as output
  //pinMode(0, OUTPUT);
  pinMode(1, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  
  dht.begin();

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
        request->send(404);
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
        request->send(404);
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
        for (i = 0; i < NUMRULES; i++) {
          if(mesurerGpio[i] == gpio && mesurerId[i] == id) {
            if(gpioTypes[gpio] == 2) {
              mesurerActive[i] = 0;
              mesurerId[i] = 0;
              mesurerGpio[i] = 0;
              mesurerTypeGpio[i] = 0;
            } else if(gpioTypes[gpio] == 1 && request->hasParam("value")
                && mesurerValues[i] == request->getParam("value")->value().toInt()) {
              mesurerActive[i] = 0;
              mesurerId[i] = 0;
              mesurerGpio[i] = 0;
              mesurerValues[i] = 0;
              mesurerTypeGpio[i] = 0;
            }
          }
        }
        request->send(200);
      } else {
        request->send(404);
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
}

void loop() {
  int packetSize = Udp.parsePacket();
  if (packetSize) {
    int n = Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    packetBuffer[n] = 0;
    String requestMessage = packetBuffer;
    requestMessage.trim();
    if (requestMessage.equals("?")) {
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write(responseUDP);
      Udp.endPacket();
    }
  }
  
  for (i = 0; i < NUMRULES; i++) {
    if(mesurerActive[i]) {
      if(mesurerTypeGpio[i] == 1) {
        if(mesurerId[i] == 0) {
          if(t > mesurerValues[i]) {
            ruleToExecute = i;
            break;
          }
        } else if(mesurerId[i] == 1) {
          if(t < mesurerValues[i]) {
            ruleToExecute = i;
            break;
          }
        } else if(mesurerId[i] == 2) {
          if(h > mesurerValues[i]) {
            ruleToExecute = i;
            break;
          }
        } else if(mesurerId[i] == 3) {
          if(h < mesurerValues[i]) {
            ruleToExecute = i;
            break;
          }
        }
      } else if(mesurerTypeGpio[i] == 2) {
        if(mesurerId[i] == 0) {
          if(!digitalRead(mesurerGpio[i])) {
            ruleToExecute = i;
            break;
          }
        }
        if(mesurerId[i] == 1) {
          if(digitalRead(mesurerGpio[i])) {
            ruleToExecute = i;
            break;
          }
        }
      }
    }
  }
  
  if (ruleToExecute != -1) {
    mesurerActive[ruleToExecute] = 0;
    for (i = 0; i < thenSize[ruleToExecute]; i++) {
      if(ToSendLocal[ruleToExecute][i]) {
        digitalWrite(String(ipsToSend[ruleToExecute][i][0]).toInt() , String(ipsToSend[ruleToExecute][i][1]).toInt());
        activateRuleType2(String(ipsToSend[ruleToExecute][i][0]).toInt(), String(ipsToSend[ruleToExecute][i][1]).toInt());
      } else {
        WiFiClient client;
        HTTPClient http;
        delay(5000);
        http.begin(client, ipsToSend[ruleToExecute][i]);
        http.POST("");
        http.end();
      }
    }
    ruleToExecute = -1;
  }

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    float newT = dht.readTemperature();
    float newH = dht.readHumidity();
    if (!(isnan(newT) || isnan(newH)))
    {
      t = newT;
      h = newH;
      activateRuleType1(t,h);
    }
  }
}
