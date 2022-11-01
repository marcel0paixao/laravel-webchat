import React, {ButtonHTMLAttributes, PropsWithChildren} from 'react';
import classNames from "classnames";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{}

const FormButton = ({children, className, ...props}: PropsWithChildren<Props>) => {
    const type:'submit'|'reset'|'button'|undefined = props.type ?? 'submit';

    return (
        <button type={type}
                {...props}
                className={classNames('py-2.5 px-6 bg-TBL_PRIMARY rounded-sm font-semibold text-base text-white disabled:opacity-25 transition text-center', className ?? '')}>
            {children}
        </button>
    );
};

export default FormButton;
