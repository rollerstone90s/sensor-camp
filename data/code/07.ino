#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int PIN_IR = 2;

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  pinMode(PIN_IR, INPUT);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("IR Line Sensor");
  delay(1500);
  lcd.clear();
}

void loop() {
  int value = digitalRead(PIN_IR);

  lcd.setCursor(0, 0);
  lcd.print("Sensor: ");
  lcd.print(value);
  lcd.print("        ");

  lcd.setCursor(0, 1);

  if (value == LOW) {
    Serial.println("พื้นขาว");
    lcd.print("White Surface   ");
  } else {
    Serial.println("เจอเส้นดำ");
    lcd.print("Black Surface     ");
  }

  delay(200);
}
