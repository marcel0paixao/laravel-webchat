import React, {PropsWithChildren} from 'react';
import classNames from "classnames";

interface Props {
    className?: string;
}

export default function OuterCenteredContainer({children, className = ''}: PropsWithChildren<Props>){
    return (
        <div className={classNames("px-4 max-w-md mx-auto mb-16 ", className)}>
            {children}
        </div>
    );
};
