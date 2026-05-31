import classNames from 'classnames';
import React, {ChangeEvent, forwardRef, InputHTMLAttributes, PropsWithChildren, useEffect, useState} from 'react';
import FormLabel from "@/Components/Form/Label";
import FormError from "@/Components/Form/Error";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    maxLength?: number;
    showCount?: boolean;
}

export type FormInputProps = Props | null;

const FormInput = forwardRef<
        HTMLInputElement,
    FormInputProps>(({ showCount = false, maxLength = 0,onChange, ...props }: PropsWithChildren<Props>, ref) => {

    const [count, setCount] = useState(0);

    useEffect(() => {
        if (props.value) {
            setCount((props.value as string).length);
        }
      }, []);

    const handleKeyUp = (e: ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e);
        }
        setCount(e.target.value.length);
    };

    return (
        <>
            {props.label && (
                <FormLabel htmlFor={props.id}>
                    {props.label}
                </FormLabel>)}
            <input
                {...props}
                maxLength={maxLength !== 0 ? maxLength : undefined}
                ref={ref}
                onChange={handleKeyUp}
                className={classNames(
                    'h-12 rounded-lg border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400 focus:ring-opacity-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
                    props.className)}/>
                {showCount && (
                <div className="mt-1 flex justify-end italic text-TBL_TERTIARY font-normal text-2xs">
                    <span>{count}</span> / <span>{maxLength}</span>
                </div>)}

            {props.error && (<FormError className={`pl-2 ${showCount ? '-mt-2':'mt-2'}`}>{props.error}</FormError>)}
        </>
    );
});
export default FormInput;
