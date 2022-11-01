import React, {ComponentProps, PropsWithChildren} from 'react';
import classNames from "classnames";

interface Props extends ComponentProps<'label'> {
    className?: string;
}

const FormLabel = ({children, className = '', ...props}: PropsWithChildren<Props>) => {

    return (
        <label htmlFor={props.htmlFor}
               className={classNames("block font-normal text-base text-TBL_MENU_COLOR leading-7", className)}>
            {children}
        </label>
    );
};

export default FormLabel;
