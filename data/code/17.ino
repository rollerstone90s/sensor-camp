const int R = 9, G = 10, B = 11;

void setColor(int r, int g, int b) {
  analogWrite(R, r);
  analogWrite(G, g);
  analogWrite(B, b);
}

void setup() {
  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
}

void loop() {
  setColor(255, 0, 0);      delay(1000);    // แดง
  setColor(0, 255, 0);      delay(1000);    // เขียว
  setColor(0, 0, 255);      delay(1000);    // น้ำเงิน
  setColor(255, 255, 0);    delay(1000);    // เหลือง
  setColor(0, 255, 255);    delay(1000);    // ฟ้า/ไซแอน
  setColor(255, 0, 255);    delay(1000);    // ชมพูบานเย็น/มาเจนต้า
  setColor(255, 255, 255);  delay(1000);    // ขาว
  setColor(255, 128, 0);    delay(1000);    // ส้ม
  setColor(128, 0, 255);    delay(1000);    // ม่วง
  setColor(255, 0, 128);    delay(1000);    // ชมพู
  setColor(128, 255, 0);    delay(1000);    // เขียวมะนาว
  setColor(0, 128, 255);    delay(1000);    // ฟ้าอมน้ำเงิน
}
