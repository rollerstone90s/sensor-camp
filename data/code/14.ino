const int PIN_A   = A0;
const int PIN_LED = 9;

const int THRESHOLD = 700;              // ระดับเสียงที่ถือว่าเป็น "ปรบมือ"
const unsigned long DEBOUNCE = 300;     // กันนับซ้ำจากเสียงค้าง (ms)

int claps = 0;
unsigned long lastClap = 0;

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("รอฟังเสียงปรบมือ...");
}

void loop() {
  int peak = 0;
  unsigned long start = millis();
  while (millis() - start < 50) {        // เก็บค่าสูงสุดใน 50 ms
    int v = analogRead(PIN_A);
    if (v > peak) peak = v;
  }

  if (peak > THRESHOLD && millis() - lastClap > DEBOUNCE) {
    claps++;
    lastClap = millis();
    Serial.print("!! ปรบมือ ครั้งที่ ");
    Serial.print(claps);
    Serial.print("  (peak = ");
    Serial.print(peak);
    Serial.println(")");

    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_LED, LOW);
  }
}
