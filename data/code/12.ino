const int PIN_SHOCK = 2;
const int PIN_LED   = 9;
int  alarms = 0;
bool lastState;

void setup() {
  pinMode(PIN_SHOCK, INPUT_PULLUP);       // กันขาลอย ไม่ให้นับผีหลอก
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);

  delay(1000);                            // รอให้นิ่งก่อนจำสถานะเริ่มต้น
  lastState = digitalRead(PIN_SHOCK);
  Serial.println("ลองเขย่าดู");
}

void loop() {
  bool now = digitalRead(PIN_SHOCK);

  if (now != lastState) {                 // สถานะเปลี่ยน = มีการสั่น
    alarms++;
    Serial.print("!! ตรวจพบการสั่น ครั้งที่ ");
    Serial.print(alarms);
    Serial.println(" !!");

    digitalWrite(PIN_LED, HIGH);

    delay(300);                           // หน่วงกันนับซ้ำจากการสั่นค้าง
    digitalWrite(PIN_LED, LOW);

    lastState = digitalRead(PIN_SHOCK);
    return;
  }
  lastState = now;
}
