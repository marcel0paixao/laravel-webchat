import React, {ComponentProps, PropsWithChildren} from 'react';
import classNames from "classnames";

interface Props extends ComponentProps<'label'> {
    className?: string;
}

const FormLabel = ({children, className = '', ...props}: PropsWithChildren<Props>) => {

    return (
        <label htmlFor={props.htmlFor}
               className={classNames("block font-normal text-base leading-7 text-slate-700 dark:text-slate-200", className)}>
            {children}
        </label>
    );
};

export default FormLabel;
