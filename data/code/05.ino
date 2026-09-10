const int PIN_RELAY = 8;
const int PIN_BUTTON = 2;

bool relayState = false;       // false = ปิด, true = เปิด
int lastButtonState = HIGH;
int buttonState = HIGH;

unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

void setup() {
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  // โมดูลรีเลย์ Active LOW: HIGH = ปิด
  digitalWrite(PIN_RELAY, HIGH);

  Serial.begin(9600);
  Serial.println("ระบบพร้อมใช้งาน");
  Serial.println("กดปุ่มเพื่อเปิด/ปิดรีเลย์");
  Serial.println("Relay: OFF");
}

void loop() {
  int reading = digitalRead(PIN_BUTTON);

  // ตรวจพบการเปลี่ยนแปลงของปุ่ม
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  // รอให้สัญญาณนิ่งก่อนประมวลผล
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      // ตรวจเฉพาะตอนกดปุ่ม
      if (buttonState == LOW) {
        relayState = !relayState;

        if (relayState == true) {
          digitalWrite(PIN_RELAY, LOW);   // เปิดรีเลย์
          Serial.println("Relay: ON");
        } else {
          digitalWrite(PIN_RELAY, HIGH);  // ปิดรีเลย์
          Serial.println("Relay: OFF");
        }
      }
    }
  }

  lastButtonState = reading;
}
