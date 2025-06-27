import { SidebarIcon } from "@phosphor-icons/react";
import styles from "../../styles/Sidebar.module.css"
import ActionBar from "./Actionbar";

export default function Sidebar() {
    return (
        <div className={styles.sidebar} style={{left: 0}}>
            <div className={styles.menu}>
                <div className={styles.section}>
                    <div className={styles.container}>
                        Graphyr
                        <SidebarIcon size={20} className={`${styles.icon} ${styles.button}`}/>
                    </div>
                </div>
            </div>
            <ActionBar/>
        </div>
    );
}

