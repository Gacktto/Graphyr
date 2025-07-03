import styles from '../../styles/Treeview.module.css';
import { SquareIcon, TextTIcon, BoundingBoxIcon } from '@phosphor-icons/react';

export type ElementNode = {
    id: string;
    type: string;
    name: string;
    children?: ElementNode[];
    style?: React.CSSProperties;
};

type TreeViewProps = {
    elements: ElementNode[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

const NodeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'text':
            return <TextTIcon weight="fill" size={15} color="rgb(158, 2, 96)" />;
        case 'frame':
            return <BoundingBoxIcon weight="fill" size={15} color="rgb(100, 100, 100)" />;
        default:
            return <SquareIcon weight="fill" size={15} color="rgb(2, 96, 158)" />;
    }
};

export default function TreeView({
    elements,
    selectedId,
    onSelect,
}: TreeViewProps) {
    const renderNode = (node: ElementNode, depth = 0) => {
        const isSelected = node.id === selectedId;

        return (
            <div
                key={node.id}
                className={`${styles.node} ${isSelected ? styles.active : ''}`}
                style={{ paddingLeft: depth * 20 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id);
                }}
            >
                <div className={styles.line}>
                    <NodeIcon type={node.type} />
                    <span className={styles.nodeName}>{node.name}</span>
                </div>
                <div className={styles.children}>
                    {node.children?.map((child) =>
                        renderNode(child, depth + 1)
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.treeview}>
            {elements.map((el) => renderNode(el))}
        </div>
    );
}
