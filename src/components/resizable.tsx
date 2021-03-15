import { ResizableBox } from 'react-resizable'
import './resizable.css'

interface ResizableProps {
  dir: 'x' | 'y'
}

const Resizable: React.FC<ResizableProps> = ({ children, dir }) => {
  return (
    <ResizableBox height={300} resizeHandles={['s']} width={Infinity}>
      {children}
    </ResizableBox>
  )
}

export default Resizable
