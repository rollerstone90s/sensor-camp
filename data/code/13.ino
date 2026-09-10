const int PIN_D  = 2;
const int LED    = 9;

bool lampOn = false;
bool lastState = LOW;
unsigned long lastClap = 0;

void setup() {
  pinMode(PIN_D, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("ปรบมือหนึ่งครั้งเพื่อเปิดหรือปิดไฟ");
}

void loop() {
  bool state = digitalRead(PIN_D);

  // จับเฉพาะจังหวะที่เพิ่งเปลี่ยนจาก LOW เป็น HIGH (ขอบขาขึ้น)
  // ไม่ใช่แค่ตัวจับเวลา เพื่อไม่ให้สลับไฟรัวตอนมีเสียงดังค้างนาน
  if (state == HIGH && lastState == LOW && millis() - lastClap > 500) {
    lastClap = millis();
    lampOn = !lampOn;
    digitalWrite(LED, lampOn);

    if (lampOn) {
      Serial.println("ปรบมือ -> เปิดไฟ");
    } else {
      Serial.println("ปรบมือ -> ปิดไฟ");
    }
  }
  lastState = state;
}
