#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
#define DHTPIN  2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

float limitTemp = 32.0;                   // เกินเท่านี้ถือว่าร้อน

void setup() {
  lcd.init();
  lcd.backlight();
  dht.begin();
  lcd.print("Weather Station");
  delay(1500);
  lcd.clear();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  lcd.setCursor(0, 0);
  if (isnan(t) || isnan(h)) {
    lcd.print("Sensor Error    ");
    lcd.setCursor(0, 1);
    lcd.print("Check wiring    ");
    delay(2000);
    return;
  }

  lcd.print("Temp ");  lcd.print(t, 1);  lcd.print((char)223); lcd.print("C   ");
  lcd.setCursor(0, 1);
  lcd.print("Humi ");  lcd.print(h, 0);  lcd.print(" %");

  if (t > limitTemp) {
    lcd.print("  HOT!");
  } else {
    lcd.print("  OK  ");
  }
  delay(2000);
}
