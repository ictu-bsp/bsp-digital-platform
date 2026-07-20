declare module "lucide-react" {
  import * as React from "react";

  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
  };

  export const ChevronLeft: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const Lock: React.FC<LucideProps>;
}
