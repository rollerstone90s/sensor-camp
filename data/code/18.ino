const int BUTTON = 2;
const int LED    = 9;

bool ledOn = false;
bool lastState = HIGH;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool state = digitalRead(BUTTON);

  if (lastState == HIGH && state == LOW) {   // จังหวะที่เพิ่งกดลง
    ledOn = !ledOn;
    digitalWrite(LED, ledOn);
    delay(50);                               // กันอาการเด้ง
  }
  lastState = state;
}
