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
                    'border-TBL_BORDERS focus:border-TBL_BORDERS focus:ring-TBL_BORDERS focus:ring-opacity-50 ' +
                    'disabled:text-TBL_TEXT_PRIMARY/50 rounded-lg bg-TBL_INPUT_BG text-xs text-TBL_MENU_COLOR placeholder:text-TBL_TEXT_PLACEHOLDER h-12',
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
