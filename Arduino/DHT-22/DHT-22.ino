#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWiFiManager.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>

#define DHTPIN 2 // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22
#define APSSID "ESP8266-01"
#define APPASS "root"

AsyncWebServer server(80);
DNSServer dns;
DHT dht(DHTPIN, DHTTYPE);
WiFiUDP Udp;
const int id = 1;
const int idDevice = 1;
float t = 0.0;
float h = 0.0;
unsigned long previousMillis = 0;
const long interval = 60000;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];

const char readResponse[] PROGMEM = R"rawliteral(
  { "Temperature": %TEMPERATURE%, 
  "Humidity": %HUMIDITY% }
)rawliteral";

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

// Replaces placeholder with DHT values
String processor(const String &var)
{
  if (var == "TEMPERATURE")
  {
    return String(t);
  }
  else if (var == "HUMIDITY")
  {
    return String(h);
  }
  return String();
}

void setup()
{
  Serial.begin(115200);
  dht.begin();

  Serial.println();
  Serial.println("Configuring access point...");
  AsyncWiFiManager wifiManager(&server, &dns);
  if (!wifiManager.autoConnect(APSSID, APPASS))
  {
    Serial.println("failed to connect and hit timeout");
    //reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(1000);
  }

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", index_html, processor);
  });
  server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "application/json", readResponse, processor);
  });
  server.onNotFound([](AsyncWebServerRequest *request) {
    request->send(404);
  });

  Udp.begin(8080);
  server.begin();
  Serial.print("Esp8266 on: ");
  Serial.println(WiFi.localIP());
  Serial.print("UDP Port: ");
  Serial.println(Udp.localPort());
}

void loop()
{
  int packetSize = Udp.parsePacket();
  if (packetSize)
  {
    Serial.printf("Received packet of size %d from %s:%d\n    (to %s:%d, free heap = %d B)\n",
                  packetSize,
                  Udp.remoteIP().toString().c_str(), Udp.remotePort(),
                  Udp.destinationIP().toString().c_str(), Udp.localPort(),
                  ESP.getFreeHeap());
    int n = Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    packetBuffer[n] = 0;
    Serial.print("Content: ");
    Serial.println(packetBuffer);
    String requestMessage = packetBuffer;
    requestMessage.trim();
    if (requestMessage.equals("?"))
    {
      requestMessage = "{\"id\": " + String(id) + ", \"idDevice\": " + String(idDevice) + "}";
      int str_len = requestMessage.length() + 1;
      char response[str_len];
      requestMessage.toCharArray(response, str_len);
      // send a reply, to the IP address and port that sent us the packet we received
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write(response);
      Udp.endPacket();
    }
  }

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval)
  {
    previousMillis = currentMillis;
    float newT = dht.readTemperature();
    float newH = dht.readHumidity();
    if (isnan(newT) || isnan(newH))
    {
      Serial.println("Failed to read from DHT sensor!");
    }
    else
    {
      t = newT;
      h = newH;
      Serial.print(t);
      Serial.print(" - ");
      Serial.println(h);
    }
  }
}
