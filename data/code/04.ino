#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int PIN_LDR = A0;
const int PIN_LED = 13;

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Light Monitor");
  delay(1500);
  lcd.clear();
}

void loop() {
  int light = analogRead(PIN_LDR);

  Serial.print("Light = ");
  Serial.println(light);

  lcd.setCursor(0, 0);
  lcd.print("Light: ");
  lcd.print(light);
  lcd.print("    ");

  lcd.setCursor(0, 1);

  // กรณีนี้มืดแล้วค่า light สูงกว่า 300
  if (light > 300) {
    digitalWrite(PIN_LED, HIGH);
    lcd.print("Status: Dark    ");
  } else {
    digitalWrite(PIN_LED, LOW);
    lcd.print("Status: Bright  ");
  }

  delay(200);
}
