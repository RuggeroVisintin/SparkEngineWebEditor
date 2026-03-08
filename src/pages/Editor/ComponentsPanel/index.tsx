import React, { useRef, useEffect } from "react";
import { Box, Button, Spacing } from "../../../primitives";
import { ListItem } from "../../../components";

interface ComponentPanelProps {
    components: string[];
    onSelectComponent?: (componentName: string) => void;
    onClose?: () => void;
}

export const ComponentsPanel = ({
    components,
    onSelectComponent,
    onClose
}: ComponentPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <Box ref={panelRef} role="listbox" aria-label="Components Panel" style={{ overflowY: 'auto', height: '100%', display: 'block' }}>
            <Box $spacing={Spacing.xs} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button aria-label="Close" onClick={() => onClose?.()}> X </Button>
            </Box>
            {
                components.map(componentName => (
                    <ListItem
                        key={componentName}
                        text={componentName}
                        onClick={() => onSelectComponent?.(componentName)} />
                ))
            }
        </Box>
    );
};