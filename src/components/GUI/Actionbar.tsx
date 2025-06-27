import { useState } from "react";
import {
  SquareIcon,
  CursorIcon,
  TextTIcon,
  ChartBarHorizontalIcon,
  ChartPieIcon,
  ChartLineIcon,
  ChartDonutIcon,
  ChartBarIcon,
  PenNibIcon,
  HandGrabbingIcon
} from "@phosphor-icons/react";
import styles from "../../styles/Actionbar.module.css";

export default function ActionBar() {
  const [selected, setSelected] = useState<string | null>(null);

  const icons = [
    { name: "cursor", icon: CursorIcon },
    { name: "hand", icon: HandGrabbingIcon },
    { name: "text", icon: TextTIcon },
    { name: "pen", icon: PenNibIcon },
    { name: "square", icon: SquareIcon },
    { name: "chartBarHorizontal", icon: ChartBarHorizontalIcon },
    { name: "chartPieIcon", icon: ChartPieIcon },
    { name: "chartLineIcon", icon: ChartLineIcon },
    { name: "chartDonutIcon", icon: ChartDonutIcon },
    { name: "chartBarIcon", icon: ChartBarIcon },
  ];

  return (
    <div className={styles.actionbar}>
      {icons.map(({ name, icon: Icon }) => (
        <Icon
          key={name}
          className={`${styles.icon} ${styles.button} ${selected === name ? styles.active : ""}`}
          onClick={() => setSelected(name)}
        />
      ))}
    </div>
  );
}
