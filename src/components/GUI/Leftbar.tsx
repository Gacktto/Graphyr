import { SidebarIcon } from "@phosphor-icons/react";
import styles from "../../styles/Sidebar.module.css"
import ActionBar from "./Actionbar";

export default function Leftbar() {
    return (
        <div className={styles.sidebar} style={{left: 0}}>
            <div className={styles.menu} style={{borderRight: "1px solid #3c3c3c"}}>
                <div className={styles.section}>
                    <div className={styles.container} style={{justifyContent: "space-between", alignItems: "center"}}>
                        Graphyr
                        <SidebarIcon size={20} className={`${styles.icon} ${styles.button}`}/>
                    </div>
                </div>
            </div>
            <ActionBar/>
        </div>
    );
}

