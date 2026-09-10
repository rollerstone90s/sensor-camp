#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int CLK = 2;
const int DT  = 3;
const int SW  = 4;

int position = 0;
int lastClk;
int lastButtonState = HIGH;

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  pinMode(CLK, INPUT);
  pinMode(DT, INPUT);
  pinMode(SW, INPUT_PULLUP);

  lastClk = digitalRead(CLK);

  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Encoder Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Position: 0");

  delay(1500);
  lcd.clear();
  showPosition();
}

void loop() {
  int clk = digitalRead(CLK);

  // ตรวจจับการหมุน Encoder
  if (clk != lastClk) {
    if (digitalRead(DT) != clk) {
      position++;       // หมุนขวา
    } else {
      position--;       // หมุนซ้าย
    }

    Serial.print("Position: ");
    Serial.println(position);

    showPosition();
  }

  lastClk = clk;

  // ตรวจจับการกดปุ่มแบบกดครั้งเดียว
  int buttonState = digitalRead(SW);

  if (lastButtonState == HIGH && buttonState == LOW) {
    position = 0;

    Serial.println("Reset");

    lcd.setCursor(0, 1);
    lcd.print("Position: 0     ");

    delay(50); // ป้องกันสัญญาณเด้ง
  }

  lastButtonState = buttonState;
}

// ฟังก์ชันแสดงค่าบน LCD
void showPosition() {
  lcd.setCursor(0, 0);
  lcd.print("Encoder Value:  ");

  lcd.setCursor(0, 1);
  lcd.print("Position: ");
  lcd.print(position);
  lcd.print("      ");  // ลบตัวเลขเก่าที่ค้างอยู่
}
