#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWiFiManager.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <WiFiUdp.h>

#define APSSID "ESP8266-01"
#define APPASS "root"

AsyncWebServer server(80);
DNSServer dns;
WiFiUDP Udp;
const int id = 2;
const int idDevice = 2;
const char responseUDP[50] = "{\"id\": 2,\"type\": 1,\"devices\": [2,2,2,2]}";
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];

const char readResponse[] PROGMEM = R"rawliteral(
  {"Values": [%V0% %V1% %V2% %V3%]} )rawliteral";

// Replaces placeholder with values
String processor(const String& var) {
  if(var == "V0"){
    return String(digitalRead(0), DEC);
  }
  else if(var == "V1"){
    return String("," + String(digitalRead(1), DEC));
  }
  else if(var == "V2"){
    return String("," + String(digitalRead(2), DEC));
  }
  else if(var == "V3"){
    return String("," + String(digitalRead(3), DEC));
  }
  else if (var == "TEMPERATURE")
  {
    return String(t);
  }
  else if (var == "HUMIDITY")
  {
    return String(h);
  }
  return String();
}

void setup() {
  // Pins set as output
  pinMode(0, OUTPUT);
  pinMode(1, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  
  AsyncWiFiManager wifiManager(&server,&dns);
  if (!wifiManager.autoConnect(APSSID, APPASS)) {
    //reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(1000);
  }

  server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "application/json", readResponse, processor);
  });
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
  server.onNotFound([](AsyncWebServerRequest *request){
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
    if(requestMessage.equals("?")){
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write(responseUDP);
      Udp.endPacket();
    }
  }
}
