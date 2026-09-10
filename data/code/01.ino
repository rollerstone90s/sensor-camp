#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int PULSE_PIN = A0;

// ค่าตรวจนิ้ว จากเซนเซอร์ของคุณ
const int FINGER_ON  = 300;
const int FINGER_OFF = 100;

// Moving Average
#define SAMP_SIZE 4
float reads[SAMP_SIZE];
float sum = 0;
int ptr = 0;

// ตรวจชีพจร
float before = 0;
int riseCount = 0;
bool rising = false;

unsigned long lastBeat = 0;

float gap1 = 0;
float gap2 = 0;
float gap3 = 0;

int bpm = 0;
bool fingerOn = false;

unsigned long lastLCD = 0;


// =====================================================
// อ่านค่าเฉลี่ย 20 ms
// =====================================================
float readPulse() {

  unsigned long start = millis();

  long total = 0;
  int count = 0;

  while (millis() - start < 20) {

    total += analogRead(PULSE_PIN);
    count++;

  }

  return (float)total / count;
}


// =====================================================
// SETUP
// =====================================================
void setup() {

  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Pulse Sensor");

  lcd.setCursor(0, 1);
  lcd.print("Place finger");

  // เตรียมค่าเริ่มต้น
  float value = readPulse();

  for (int i = 0; i < SAMP_SIZE; i++) {
    reads[i] = value;
  }

  sum = value * SAMP_SIZE;
  before = value;

  delay(1000);
  lcd.clear();
}


// =====================================================
// LOOP
// =====================================================
void loop() {

  // -------------------------------------------------
  // 1. อ่าน Sensor
  // -------------------------------------------------

  float raw = readPulse();


  // -------------------------------------------------
  // 2. Moving Average
  // -------------------------------------------------

  sum -= reads[ptr];

  reads[ptr] = raw;

  sum += raw;

  ptr++;

  if (ptr >= SAMP_SIZE) {
    ptr = 0;
  }

  float signal = sum / SAMP_SIZE;


  // -------------------------------------------------
  // 3. ตรวจว่ามีนิ้วหรือไม่
  // -------------------------------------------------

  if (!fingerOn && signal > FINGER_ON) {

    fingerOn = true;

    bpm = 0;

    lastBeat = 0;

    gap1 = 0;
    gap2 = 0;
    gap3 = 0;

    riseCount = 0;
    rising = false;

    before = signal;
  }


  if (fingerOn && signal < FINGER_OFF) {

    fingerOn = false;

    bpm = 0;

    lastBeat = 0;

    gap1 = 0;
    gap2 = 0;
    gap3 = 0;

    riseCount = 0;
    rising = false;
  }


  // -------------------------------------------------
  // 4. ตรวจจับชีพจร
  // -------------------------------------------------

  if (fingerOn) {

    // สัญญาณกำลังขึ้น
    if (signal > before) {

      riseCount++;


      // ขึ้นต่อเนื่อง 4 ครั้ง
      if (!rising && riseCount >= 4) {

        rising = true;

        unsigned long now = millis();


        // Beat แรก
        if (lastBeat == 0) {

          lastBeat = now;

        }

        else {

          unsigned long gap = now - lastBeat;


          // 40 - 200 BPM
          if (gap >= 300 && gap <= 1500) {

            lastBeat = now;


            // เลื่อนค่าเก่า
            gap3 = gap2;
            gap2 = gap1;
            gap1 = gap;


            // มีข้อมูลครบ 3 Beat
            if (gap3 > 0) {

              float average =
                (gap1 * 0.4) +
                (gap2 * 0.3) +
                (gap3 * 0.3);


              int newBPM =
                60000.0 / average;


              if (newBPM >= 40 &&
                  newBPM <= 180) {

                bpm = newBPM;

              }
            }

          }


          // ถ้านานเกินไป เริ่มใหม่
          if (gap > 1500) {

            lastBeat = now;

            gap1 = 0;
            gap2 = 0;
            gap3 = 0;

            bpm = 0;
          }
        }
      }
    }

    else {

      rising = false;
      riseCount = 0;

    }
  }


  before = signal;


  // -------------------------------------------------
  // 5. Serial Monitor / Plotter
  // -------------------------------------------------

  Serial.print("Signal:");
  Serial.print(signal);

  Serial.print("\tBPM:");
  Serial.println(bpm);


  // -------------------------------------------------
  // 6. LCD
  // -------------------------------------------------

  if (millis() - lastLCD >= 500) {

    lastLCD = millis();

    lcd.setCursor(0, 0);


    // ไม่มีนิ้ว
    if (!fingerOn) {

      lcd.print("BPM: ---        ");

      lcd.setCursor(0, 1);
      lcd.print("Place finger    ");

    }


    // มีนิ้ว
    else {

      lcd.print("BPM: ");

      if (bpm == 0) {

        lcd.print("...        ");

      }

      else {

        lcd.print(bpm);
        lcd.print("         ");

      }


      lcd.setCursor(0, 1);

      lcd.print("Signal:");

      lcd.print((int)signal);

      lcd.print("      ");
    }
  }
}
