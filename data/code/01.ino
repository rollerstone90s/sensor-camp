#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);

const int PIN_PULSE = A0;

const int  AMP_MIN     = 12;    // แอมพลิจูดขั้นต่ำที่ถือว่า "มีนิ้ว" (ปรับได้)
const unsigned long WIN = 1000; // หน้าต่างวัดแอมพลิจูด 1 วินาที
const unsigned long TIMEOUT = 2500;

float ema = 0, baseline = 0;
bool  beating = false, fingerOn = false;
unsigned long lastBeat = 0, winStart = 0;
int   bpm = 0;
int   sigMax = 0, sigMin = 1023;

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.print("Pulse Sensor");
  lcd.setCursor(0, 1);
  lcd.print("Place finger");
  ema = baseline = analogRead(PIN_PULSE);
  delay(1500);
  lcd.clear();
  winStart = millis();
}

void loop() {
  int raw = analogRead(PIN_PULSE);
  ema      = 0.75 * ema      + 0.25 * raw;
  baseline = 0.98 * baseline + 0.02 * ema;

  // ---- เก็บ max/min ในหน้าต่างเวลา ----
  if (ema > sigMax) sigMax = ema;
  if (ema < sigMin) sigMin = ema;

  if (millis() - winStart >= WIN) {
    int amp = sigMax - sigMin;
    fingerOn = (amp >= AMP_MIN);
    sigMax = 0; sigMin = 1023;
    winStart = millis();
    if (!fingerOn) { bpm = 0; beating = false; }
    showScreen();
  }

  // ---- ตรวจจับ beat เฉพาะตอนมีนิ้ว ----
  if (fingerOn) {
    if (!beating && ema > baseline + 6 && millis() - lastBeat > 300) {
      beating = true;
      unsigned long gap = millis() - lastBeat;
      lastBeat = millis();

      if (gap < 2000) {
        int v = 60000 / gap;
        if (v >= 40 && v <= 200) { bpm = v; showScreen(); }
      }
    }
    if (beating && ema < baseline + 2) beating = false;

    // ---- ไม่เจอ beat นานเกินไป = รีเซ็ต ----
    if (millis() - lastBeat > TIMEOUT && bpm != 0) {
      bpm = 0;
      showScreen();
    }
  }

  delay(10);
}

void showScreen() {
  lcd.setCursor(0, 0);
  if (!fingerOn) {
    lcd.print("BPM = 0         ");
    lcd.setCursor(0, 1);
    lcd.print("Place finger    ");
    return;
  }

  lcd.print("BPM = ");
  lcd.print(bpm);
  lcd.print("      ");

  lcd.setCursor(0, 1);
  if (bpm == 0) {
    lcd.print("Reading...      ");
  } else {
    int bars = constrain(map(bpm, 50, 150, 1, 16), 1, 16);
    for (int i = 0; i < 16; i++) lcd.print(i < bars ? '#' : ' ');
  }
}
