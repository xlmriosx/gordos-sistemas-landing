import type { ComponentProps } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * react-resizable-panels wrapped with brand styling. Compose:
 * <ResizablePanelGroup direction="horizontal">
 *   <ResizablePanel/><ResizableHandle withHandle/><ResizablePanel/>
 * </ResizablePanelGroup>.
 */
export function ResizablePanelGroup({ className, ...props }: ComponentProps<typeof PanelGroup>) {
  return <PanelGroup className={cn('resizable-group', className)} {...props} />;
}

export const ResizablePanel = Panel;

export interface ResizableHandleProps extends ComponentProps<typeof PanelResizeHandle> {
  /** Draws the grip affordance in the middle of the handle. */
  withHandle?: boolean;
}

export function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    <PanelResizeHandle className={cn('resizable-handle', className)} {...props}>
      {withHandle ? (
        <span className="resizable-grip">
          <GripVertical size={12} strokeWidth={1.5} />
        </span>
      ) : null}
    </PanelResizeHandle>
  );
}
