const int PIN_TAP = 2;
const int BUZZER  = 8;

volatile bool tapped = false;
volatile unsigned long lastTapTime = 0;

void setup() {
  pinMode(PIN_TAP, INPUT);
  pinMode(BUZZER, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(PIN_TAP), onTap, FALLING);
}

void onTap() {
  unsigned long now = millis();
  if (now - lastTapTime > 250) {
    tapped = true;
    lastTapTime = now;
  }
}

void loop() {
  if (tapped) {
    tapped = false;

    for (int i = 0; i < 4; i++) {
      tone(BUZZER, 2000);
      delay(100);
      noTone(BUZZER);
      delay(100);
    }
  }
}
