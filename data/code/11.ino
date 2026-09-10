#define FLAME_PIN  2
#define BUZZER_PIN 8

int val = 0;

void setup() {
  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  val = digitalRead(FLAME_PIN);

  if (val == LOW) {   // เจอไฟ
    tone(BUZZER_PIN, 2000);
    delay(100);
    noTone(BUZZER_PIN);
    delay(100);
  }
  else {
    noTone(BUZZER_PIN);
  }
}
