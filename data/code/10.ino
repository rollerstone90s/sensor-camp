#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int TRIG = 9, ECHO = 10;
void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  lcd.init(); lcd.backlight();
  lcd.print("Parking Sensor");
  delay(1500);
  lcd.clear();
}
void loop() {
  float cm = readDistance();
  lcd.setCursor(0, 0);
  if (cm <= 0) {
    lcd.print("Out of range    ");
    lcd.setCursor(0, 1); lcd.print("                ");
    delay(250);
    return;
  }
  lcd.print("Dist ");
  lcd.print(cm, 0);
  lcd.print(" cm      ");
  lcd.setCursor(0, 1);
  if (cm > 50) {
    lcd.print("SAFE            ");
    delay(200);
  } else if (cm > 10) {
    int bars = map((long)cm, 10, 50, 16, 1);     // ใกล้ = แถบยาว
    for (int i = 0; i < 16; i++) lcd.print(i < bars ? (char)255 : ' ');
    delay(map((long)cm, 10, 50, 60, 500));
  } else {
    lcd.print(">>>  STOP!  <<<<");
    delay(450);
  }
}
float readDistance() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long t = pulseIn(ECHO, HIGH, 30000);
  if (t == 0) return -1;
  return t * 0.0343 / 2;
}
