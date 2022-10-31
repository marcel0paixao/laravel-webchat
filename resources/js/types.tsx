import React from "react";

// Redecalare forwardRef
declare module "react" {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

type DateTime = string;

export type Nullable<T> = T | null;
