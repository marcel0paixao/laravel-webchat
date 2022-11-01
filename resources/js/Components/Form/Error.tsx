import React, {ComponentProps, PropsWithChildren} from 'react';
import classNames from "classnames";

interface Props {
    className?: string;
}

const FormError = ({children, className = ''}: PropsWithChildren<Props>) => {

    return (
        (<div>
            <p className={classNames("text-xs text-TBL_DANGER font-medium", className)}>{children}</p>
        </div>)
    );
};

export default FormError;
