#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial pms(10, 11);
byte buf[32];
unsigned long lastValidRead = 0;
const unsigned long TIMEOUT = 5000;   // ถ้าไม่มีข้อมูลใหม่ใน 5 วิ = ค้าง

void setup() {
  Serial.begin(9600);
  pms.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("PM2.5 Monitor");
  delay(1500);
  lcd.clear();
  lastValidRead = millis();
}

void loop() {
  // หาไบต์เริ่มต้นแพ็กเก็ตให้ตรงก่อน
  if (pms.available() > 0 && pms.peek() != 0x42) {
    pms.read();   // ทิ้งไบต์ขยะจนกว่าจะเจอ 0x42
    return;
  }

  if (pms.available() >= 32) {
    pms.readBytes(buf, 32);
    if (buf[0] == 0x42 && buf[1] == 0x4D) {
      int pm25 = buf[12] * 256 + buf[13];
      lastValidRead = millis();

      Serial.print("PM2.5 = ");
      Serial.print(pm25);
      Serial.println(" ug/m3");

      lcd.setCursor(0, 0);
      lcd.print("PM2.5:        ");
      lcd.setCursor(7, 0);
      lcd.print(pm25);
      lcd.print(" ug/m3");

      lcd.setCursor(0, 1);
      if (pm25 <= 25)      lcd.print("Air: Good      ");
      else if (pm25 <= 37) lcd.print("Air: Moderate  ");
      else if (pm25 <= 50) lcd.print("Air: Unhealthy ");
      else                 lcd.print("Air: Hazardous ");
    }
  }

  // ถ้าไม่มีข้อมูลใหม่นานเกินไป แจ้งเตือนว่าค้าง
  if (millis() - lastValidRead > TIMEOUT) {
    lcd.setCursor(0, 0);
    lcd.print("No Signal!      ");
    lcd.setCursor(0, 1);
    lcd.print("Check sensor    ");
  }
}
