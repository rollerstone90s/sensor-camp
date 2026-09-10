#define LASER_PIN    9
#define RECEIVER_AO  A0
#define BUZZER_PIN   8

int threshold = 50;
unsigned long lastPrint = 0;

void setup() {
  pinMode(LASER_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);

  digitalWrite(LASER_PIN, HIGH);   // เปิดลำแสงค้างไว้
  noTone(BUZZER_PIN);
}

void loop() {
  int val = analogRead(RECEIVER_AO);   // อ่านทุกรอบ ไม่หน่วง

  if (val > threshold) {
    tone(BUZZER_PIN, 2000);
  } else {
    noTone(BUZZER_PIN);
  }

  if (millis() - lastPrint >= 100) {   // print แค่ทุก 100ms พอ ไม่ให้ Serial ถ่วง loop
    Serial.print("Receiver A0 = ");
    Serial.println(val);
    lastPrint = millis();
  }
}
