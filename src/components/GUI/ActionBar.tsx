import { SquareIcon } from "@phosphor-icons/react"
import type { HTMLAttributes } from "react"

type Props = HTMLAttributes<HTMLDivElement>

export default function ActionBar(props: Props) {
  return (
    <div className="action-bar" {...props}>
      <SquareIcon size={20} color="grey" style={style} />
    </div>
  )
}

const style: React.CSSProperties = {
  width: "200px",
  height: "50px",
  backgroundColor: "#3C3C3C",
}
