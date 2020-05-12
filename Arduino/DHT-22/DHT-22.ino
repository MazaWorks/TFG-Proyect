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

AsyncWebServer server(80);
DNSServer dns;
DHT dht(2, DHT22);
WiFiUDP Udp;
float t = 0.0;
float h = 0.0;
unsigned long previousMillis = 0;
const long interval = 60000;
const char rules[2][10] = {"turnOff", "turnOn"};
const char responseUDP[50] = "{\"id\": 1,\"type\": 1,\"devices\": [2,2,1,2]}";
StaticJsonDocument<JSON_OBJECT_SIZE(2) + 20 * JSON_OBJECT_SIZE(3)> doc;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];
int mesurerId[10] = {0,0,0,0,0,0,0,0,0,0};
int mesurerValues[10] = {0,0,0,0,0,0,0,0,0,0};
int thenSize[10] = {0,0,0,0,0,0,0,0,0,0};
char ipsToSend[10][10][50];
int rule = 0;
String body;

/* On DHT22, replace a %V#% by : {"Temperature": %TEMPERATURE%, "Humidity": %HUMIDITY%}*/
const char readResponse[] PROGMEM = R"rawliteral(
{"Values": [%V0%, %V1%, {"Temperature": %TEMPERATURE%, "Humidity": %HUMIDITY%}, %V3%]} )rawliteral";
  
// Replaces placeholder with values
String processor(const String& var) {
  if(var == "V0"){
    return String(digitalRead(0), DEC);
  }
  else if(var == "V1"){
    return String(digitalRead(1), DEC);
  }
  else if(var == "V2"){
    return String(digitalRead(2), DEC);
  }
  else if(var == "V3"){
    return String(digitalRead(3), DEC);
  }
  else if (var == "TEMPERATURE"){
    return String(t);
  }
  else if (var == "HUMIDITY"){
    return String(h);
  }
  else{
    return String("0");
  }
}

void Automatize(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
  for(size_t i=0; i<len; i++){
    body += (char)data[i];
  }
  if(index + len == total){
    DeserializationError err = deserializeJson(doc, body);
    body = "";
    if (err) {
      request->send(400);
    } else {
      JsonObject mesurer = doc["if"].as<JsonObject>();
      for (byte i = 0; i < 10; i++) {
        if(mesurerId[i] == 0 && mesurerValues[i] == 0){
          JsonObject act;
          JsonArray then = doc["then"].as<JsonArray>();
          mesurerId[i] = mesurer["id"].as<int>();
          mesurerValues[i] = mesurer["value"].as<int>();
          thenSize[i] = then.size();
          for (byte i2 = 0; i2 < then.size(); i2++) {
            act = then[i2].as<JsonObject>();
            String("http://" + act["ip"].as<String>() + "/" + rules[act["id"].as<int>()] + "?pin=" + act["gpio"].as<String>()).toCharArray(ipsToSend[i][i2], 50);
          }
          break;
        }
      }
      request->send(200);
    }
  }
}

void setup() {
  //Serial.begin(9600);
  // Pins set as output
  pinMode(0, OUTPUT);
  pinMode(1, OUTPUT);
  //pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  
  //dht.begin();

  AsyncWiFiManager wifiManager(&server, &dns);
  if (!wifiManager.autoConnect(APSSID, APPASS)){
    ESP.reset();
    delay(1000);
  }
  
  server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "application/json", readResponse, processor);
  });  
  server.on("/automatize", HTTP_POST, [](AsyncWebServerRequest * request){}, NULL, Automatize);
  server.on("/turnOn", HTTP_POST, [](AsyncWebServerRequest *request){
    if(request->hasParam("pin")) {
      AsyncWebParameter* p = request->getParam("pin");
      int pin = p->value().toInt();
      if((pin == 0 && p->value().equals(String(0))) || (pin > 0 && pin < 4)){
        digitalWrite(p->value().toInt(), HIGH);
        request->send_P(200, "application/json", readResponse, processor);
      } else {
        request->send(400);
      }
    } else {
      request->send(400);
    }
  });
  server.on("/turnOff", HTTP_POST, [](AsyncWebServerRequest *request){
    if(request->hasParam("pin")) {
      AsyncWebParameter* p = request->getParam("pin");
      int pin = p->value().toInt();
      if((pin == 0 && p->value().equals(String(0))) || (pin > 0 && pin < 4)) {
        digitalWrite(p->value().toInt(), LOW);
        request->send_P(200, "application/json", readResponse, processor);
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
}

void loop()
{  
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
  
  for (byte i = 0; i < 10; i++) {
    if(mesurerId[i] != 0) {
      switch (mesurerId[i]) {
        case 1:
          if(t > mesurerValues[i]){
            rule = i + 1;
          }
          break;
        case 2:
          if(t < mesurerValues[i]){
            rule = i + 1;
          }
          break;
        case 3:
          if(h > mesurerValues[i]){
            rule = i + 1;
          }
          break;
        case 4:
          if(h < mesurerValues[i]){
            rule = i + 1;
          }
          break;
      }
    }
  }
  
  if (rule != 0) {
    //Serial.println(rule);
    for (byte i = 0; i < thenSize[rule - 1]; i++) {
        WiFiClient client;
        HTTPClient http;
        delay(5000);
        http.begin(client, ipsToSend[rule - 1][i]);
        int httpCode = http.POST("");
        // httpCode will be negative on error
        if (httpCode == 200) {
          //Serial.println("DONE WELL");
        } else {
          //Serial.printf("POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }
        http.end();
    }
    mesurerId[rule - 1] = 0;
    rule = 0;
  }

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval){
    previousMillis = currentMillis;
    float newT = dht.readTemperature();
    float newH = dht.readHumidity();
    //Serial.println(isnan(newT));
    if (!(isnan(newT) || isnan(newH)))
    {
      t = newT;
      h = newH;
    }
  }
}
