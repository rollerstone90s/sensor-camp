const int PIN_REED   = 2;
const int PIN_BUZZER = 8;

void setup() {
  pinMode(PIN_REED, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(PIN_REED) == HIGH) {      // สลับจาก LOW เป็น HIGH
    Serial.println("ประตูปิด (แม่เหล็กอยู่ใกล้)");
    digitalWrite(13, LOW);
    noTone(PIN_BUZZER);
  } else {
    Serial.println("!! ประตูถูกเปิด !!");
    digitalWrite(13, HIGH);
    tone(PIN_BUZZER, 1000);
  }
  delay(300);
}
