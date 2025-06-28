import styles from "../../styles/Sidebar.module.css"
import buttonStyles from "../../styles/Buttons.module.css"
import { 
    GlobeIcon, 
    ShareFatIcon,
    AlignBottomIcon,
    AlignLeftIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    FlipHorizontalIcon,
    FlipVerticalIcon
} from "@phosphor-icons/react";

export default function Rightbar() {
    return (
        <div className={styles.sidebar} style={{right: 0}}>
            <div className={styles.menu} style={{borderLeft: "1px solid #3c3c3c"}}>
                <div className={styles.section}>
                    <div className={styles.container}>
                        <div className={`${buttonStyles.button} ${buttonStyles.primary}`}>
                            Publish
                            <GlobeIcon size={20} className={styles.icon}/>
                        </div>
                        <div className={`${buttonStyles.button} ${buttonStyles.primary}`}>
                            {/* Share */}
                            <ShareFatIcon weight="fill" size={20} className={styles.icon}/>
                        </div>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.container} style={{flexDirection: "column"}}>
                        Layout

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Vertical Align</div>
                                <div className={styles.groupContent}>
                                    <AlignBottomIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterVerticalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignTopIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Horizontal Align</div>
                                <div className={styles.groupContent}>
                                    <AlignLeftIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterHorizontalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignRightIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Flip</div>
                                <div className={styles.groupContent}>
                                    <FlipHorizontalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <FlipVerticalIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Position</div>
                                <div className={styles.group} style={{flexDirection: "row"}}>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>X</div>
                                        <input type="text" className={styles.input}/>
                                    </div>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>Y</div>
                                        <input type="text" className={styles.input}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                    </div>
                </div>
            </div>
        </div>
    );
}