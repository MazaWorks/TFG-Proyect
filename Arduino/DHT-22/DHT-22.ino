#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWiFiManager.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
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
const char responseUDP[50] = "{\"id\": 1,\"type\": 1,\"devices\": [2,2,1,2]}";
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];

const char readResponse[] PROGMEM = R"rawliteral(
  {"Values": [%V0% %V1%, {"Temperature": %TEMPERATURE%, 
  "Humidity": %HUMIDITY%} %V3%]} )rawliteral";
  
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
  pinMode(3, OUTPUT);
  
  dht.begin();

  AsyncWiFiManager wifiManager(&server, &dns);
  if (!wifiManager.autoConnect(APSSID, APPASS)){
    ESP.reset();
    delay(1000);
  }
  
  server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request) {
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

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval){
    previousMillis = currentMillis;
    float newT = dht.readTemperature();
    float newH = dht.readHumidity();
    if (!(isnan(newT) || isnan(newH)))
    {
      t = newT;
      h = newH;
    }
  }
}

/*
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <style>
    html {
     font-family: Arial;
     display: inline-block;
     margin: 0px auto;
     text-align: center;
    }
    h2 { font-size: 3.0rem; }
    p { font-size: 3.0rem; }
    .units { font-size: 1.2rem; }
    .dht-labels{
      font-size: 1.5rem;
      vertical-align:middle;
      padding-bottom: 15px;
    }
  </style>
</head>
<body>
  <h2>ESP8266 DHT Server</h2>
  <p>
    <i class="fas fa-thermometer-half" style="color:#059e8a;"></i> 
    <span class="dht-labels">Temperature</span> 
    <span id="temperature">%TEMPERATURE%</span>
    <sup class="units">&deg;C</sup>
  </p>
  <p>
    <i class="fas fa-tint" style="color:#00add6;"></i> 
    <span class="dht-labels">Humidity</span>
    <span id="humidity">%HUMIDITY%</span>
    <sup class="units">%</sup>
  </p>
</body>
<script>
setInterval(function ( ) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        document.getElementById("temperature").innerHTML = myArr.Temperature;
        document.getElementById("humidity").innerHTML = myArr.Humidity;
    }
  };
  xhttp.open("GET", "/readings", true);
  xhttp.send();
}, 60000 ) ;
</script>
</html>)rawliteral";
*/
