#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int PIN_HALL = 2;

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  pinMode(PIN_HALL, INPUT);

  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Magnetic Sensor");
  delay(1500);
  lcd.clear();
}

void loop() {
  int hallValue = digitalRead(PIN_HALL);

  lcd.setCursor(0, 0);
  lcd.print("Hall: ");
  lcd.print(hallValue);
  lcd.print("          ");

  lcd.setCursor(0, 1);

  if (hallValue == LOW) {
    Serial.println("พบแม่เหล็ก");
    lcd.print("Magnet Found    ");
  } else {
    Serial.println("ไม่พบแม่เหล็ก");
    lcd.print("No Magnet       ");
  }

  delay(150);
}
