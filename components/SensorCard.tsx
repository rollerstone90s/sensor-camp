import CodeBlock from "@/components/CodeBlock";
import WiringFigure from "@/components/WiringFigure";
import { pinGroups, type Sensor, wiringImage } from "@/lib/data";
import { highlight } from "@/lib/highlight";

export default function SensorCard({ sensor: s }: { sensor: Sensor }) {
  const img = wiringImage(s.no);
  const groups = pinGroups(s);

  return (
    <article className={`card g-${s.group}`} id={`s${s.no}`}>
      <div className="card-top">
        <div className="s-no">{s.no}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="s-name">{s.th}</h2>
          <p className="s-en">{s.en}</p>
        </div>
      </div>

      <div className="body">
        <div className="pane">
          <div className="pane-h">การต่อสาย</div>
          {groups.map((g) => (
            <div className="wire-group" key={g.device}>
              {/* ต่อหลายอุปกรณ์ในการ์ดเดียว จึงบอกให้ชัดว่าสายชุดไหนของอะไร */}
              {groups.length > 1 && <p className="wire-device">{g.device}</p>}
              <ul className="wires">
                {g.pins.map((p, i) => (
                  <li className={`wire w-${p[2]}`} key={i}>
                    <div>
                      <div className="wire-l">{p[0]}</div>
                      <div className="wire-n">{p[3]}</div>
                    </div>
                    <div className="wire-r">
                      <span className="pin">{p[1]}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {img && <WiringFigure src={img} title={s.th} />}
          <div className="steps-box">
            <p className="steps-h">วิธีการทดลอง</p>
            <ol className="steps-list">
              {s.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="pane">
          <CodeBlock code={s.code} html={highlight(s.code)} />
        </div>
      </div>

      <details className="more">
        <summary>ทำงานอย่างไร และเอาไปทำอะไรต่อได้</summary>
        <div className="more-in">
          <div className="blk">
            <h4>หลักการทำงาน</h4>
            <p>{s.how}</p>
          </div>
          <div className="blk">
            <h4>ผลลัพธ์ที่ควรเห็น</h4>
            <p>{s.result}</p>
          </div>
          <div className="blk">
            <h4>ลองต่อยอด</h4>
            <p>{s.next}</p>
          </div>
          <div className="blk">
            <h4>ใช้จริงในอาชีพ</h4>
            <p>{s.job}</p>
          </div>
        </div>
      </details>
    </article>
  );
}
