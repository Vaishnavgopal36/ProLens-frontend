import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { LayoutGroup, motion } from "motion/react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  layoutId?: string;
}

const TabsContext = React.createContext<TabsContextValue>({});

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  layoutId?: string;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      layoutId: customLayoutId,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const layoutId = customLayoutId ?? generatedId;
    const [internalValue, setInternalValue] = React.useState<string | undefined>(
      defaultValue,
    );

    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : internalValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    const contextValue = React.useMemo<TabsContextValue>(
      () => ({
        value: activeValue,
        onValueChange: handleValueChange,
        layoutId,
      }),
      [activeValue, handleValueChange, layoutId],
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <LayoutGroup id={layoutId}>
          <TabsPrimitive.Root
            ref={ref}
            value={controlledValue}
            defaultValue={defaultValue}
            onValueChange={handleValueChange}
            {...props}
          >
            {children}
          </TabsPrimitive.Root>
        </LayoutGroup>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg border border-border-subtle bg-canvas-bg p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  indicatorClassName?: string;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, value, indicatorClassName, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const internalRef = React.useRef<HTMLButtonElement | null>(null);
  const [isDomActive, setIsDomActive] = React.useState(false);

  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [ref],
  );

  React.useEffect(() => {
    const el = internalRef.current;
    if (!el) return;

    const checkActive = () => {
      setIsDomActive(el.getAttribute("data-state") === "active");
    };
    checkActive();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          checkActive();
        }
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, []);

  const isActive =
    context.value !== undefined ? context.value === value : isDomActive;

  const activeBgMatch = className?.match(/data-\[state=active\]:bg-(\S+)/);
  const indicatorBgClass =
    indicatorClassName ||
    (activeBgMatch ? `bg-${activeBgMatch[1]}` : "bg-canvas-surface");

  const sanitizedClassName = className
    ?.replace(/data-\[state=active\]:bg-\S+/g, "")
    .trim();

  return (
    <TabsPrimitive.Trigger
      ref={setRef}
      value={value}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
        sanitizedClassName,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className={cn(
            "absolute inset-0 rounded-md shadow-xs pointer-events-none will-change-transform",
            indicatorBgClass,
          )}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
          }}
          style={{ zIndex: 0 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5 pointer-events-none">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
